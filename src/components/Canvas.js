import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ref, onValue, push, remove, set, onDisconnect } from 'firebase/database';
import { database, auth } from '../firebase';
import './Canvas.css';

// Choose an animal emoji from a curated list and return the Twemoji PNG URL
const animalCodepoints = [
  '1f431', // 🐱 cat face
  '1f436', // 🐶 dog face
  '1f981', // 🦁 lion face
  '1f42f', // 🐯 tiger face
  '1f43a', // 🐺 wolf
  '1f98a', // 🦊 fox
  '1f43b', // 🐻 bear
  '1f428', // 🐨 koala
  '1f430', // 🐰 rabbit face
  '1f439', // 🐹 hamster
  '1f42d', // 🐭 mouse face
  '1f438', // 🐸 frog
  '1f435', // 🐵 monkey face
  '1f43c', // 🐼 panda
  '1f43e', // 🐾 paw prints
  '1f41f', // 🐟 fish
  '1f420', // 🐠 tropical fish
  '1f421', // 🐡 blowfish
  '1f433', // 🐳 spouting whale
  '1f40b', // 🐋 whale
  '1f42c', // 🐬 dolphin
  '1f40c', // 🐌 snail
  '1f41d', // 🐝 honeybee
  '1f98b', // 🦋 butterfly
  '1f41b', // 🐛 bug
  '1f99c', // 🦜 parrot
  '1f99a', // 🦚 peacock
  '1f985', // 🦅 eagle
  '1f427', // 🐧 penguin
  '1f426'  // 🐦 bird
];

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const getAvatarUrl = (seed) => {
  const idx = simpleHash(seed) % animalCodepoints.length;
  const cp = animalCodepoints[idx];
  return `https://twemoji.maxcdn.com/v/latest/72x72/${cp}.png`;
};

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [userCursors, setUserCursors] = useState({});
  const [currentStroke, setCurrentStroke] = useState(null);
  const [context, setContext] = useState(null);

  const redrawRafIdRef = useRef(null);
  const lastCursorSendMsRef = useRef(0);

  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth - 300; // Account for sidebar
    canvas.height = window.innerHeight - 100; // Account for header
    
    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setContext(ctx);
  }, []);

  const scheduleRedraw = useCallback(() => {
    if (!context) return;
    if (redrawRafIdRef.current) {
      cancelAnimationFrame(redrawRafIdRef.current);
    }
    redrawRafIdRef.current = requestAnimationFrame(() => {
      if (!canvasRef.current || !context) return;
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // Iterate through all user strokes
      Object.values(strokes).forEach(userStrokes => {
        if (userStrokes && typeof userStrokes === 'object') {
          Object.values(userStrokes).forEach(stroke => {
            if (stroke.points && stroke.points.length > 0) {
              context.beginPath();
              context.moveTo(stroke.points[0].x, stroke.points[0].y);
              stroke.points.forEach(point => {
                context.lineTo(point.x, point.y);
              });
              context.stroke();
            }
          });
        }
      });
    });
  }, [context, strokes]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && context) {
        canvas.width = window.innerWidth - 300;
        canvas.height = window.innerHeight - 100;
        scheduleRedraw();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [context, scheduleRedraw]);

  // Listen to strokes from Firebase
  useEffect(() => {
    const strokesRef = ref(database, 'strokes');
    const unsubscribe = onValue(strokesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStrokes(data);
      } else {
        setStrokes({});
      }
    });

    return () => unsubscribe();
  }, []);

  // Redraw when strokes or context change, batched via rAF
  useEffect(() => {
    if (context) {
      scheduleRedraw();
    }
  }, [strokes, context, scheduleRedraw]);

  // Listen to online users
  useEffect(() => {
    const usersRef = ref(database, 'onlineUsers');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOnlineUsers(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to user cursors
  useEffect(() => {
    const cursorsRef = ref(database, 'cursors');
    const unsubscribe = onValue(cursorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserCursors(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Set up user presence
  useEffect(() => {
    if (!userId) return;

    const userRef = ref(database, `onlineUsers/${userId}`);
    const userCursorRef = ref(database, `cursors/${userId}`);

    // Generate a new avatar seed per session/refresh
    const sessionAvatarSeed = `${currentUser.email || userId}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    
    // Set user as online
    set(userRef, {
      email: currentUser.email,
      avatarSeed: sessionAvatarSeed,
      timestamp: Date.now()
    });

    // Set up disconnect cleanup
    onDisconnect(userRef).remove();
    onDisconnect(userCursorRef).remove();

    // Function to clean up user's strokes
    const cleanupUserStrokes = () => {
      // Remove all strokes that belong to this user
      const userStrokesRef = ref(database, `strokes/${userId}`);
      remove(userStrokesRef);
    };

    // Handle page unload/reload
    const handleBeforeUnload = () => {
      // Remove user's strokes immediately when page is about to unload
      cleanupUserStrokes();
      remove(userRef);
      remove(userCursorRef);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Remove user from online users when component unmounts
      cleanupUserStrokes();
      remove(userRef);
      remove(userCursorRef);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, currentUser.email]);

  // Handle cursor movement (throttled DB updates)
  const handleMouseMove = useCallback((e) => {
    if (!userId) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor position in Firebase (throttle to ~30fps)
    const now = Date.now();
    if (now - lastCursorSendMsRef.current >= 33) {
      lastCursorSendMsRef.current = now;
      const cursorRef = ref(database, `cursors/${userId}`);
      set(cursorRef, {
        x,
        y,
        email: currentUser.email,
        timestamp: now
      });
    }

    // Check if mouse button is pressed and we have a current stroke
    if (e.buttons === 1 && currentStroke && context) {
      // Point sampling: skip very tiny moves
      const lastPoint = currentStroke.points[currentStroke.points.length - 1];
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) {
        return;
      }

      // Draw current stroke
      context.lineTo(x, y);
      context.stroke();
      
      // Update current stroke points
      setCurrentStroke(prev => ({
        ...prev,
        points: [...prev.points, { x, y }]
      }));
    }
  }, [isDrawing, currentStroke, context, userId, currentUser.email]);

  // Handle mouse down
  const handleMouseDown = useCallback((e) => {
    if (!userId || !context) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    
    const newStroke = {
      userId,
      userEmail: currentUser.email,
      points: [{ x, y }],
      timestamp: Date.now()
    };
    
    setCurrentStroke(newStroke);
    context.beginPath();
    context.moveTo(x, y);
  }, [userId, context, currentUser.email]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (!userId || !currentStroke) return;

    setIsDrawing(false);
    
    // Save stroke to Firebase under user's ID
    const userStrokesRef = ref(database, `strokes/${userId}`);
    const newStrokeRef = push(userStrokesRef);
    set(newStrokeRef, currentStroke);
    
    setCurrentStroke(null);
  }, [userId, currentStroke]);

  // Global mouse up handler to catch mouse release outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing && currentStroke) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDrawing, currentStroke, handleMouseUp]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    // Don't clear the current stroke, just stop drawing
    setIsDrawing(false);
  }, []);

  // Handle mouse enter
  const handleMouseEnter = useCallback((e) => {
    // If we have a current stroke and the mouse button is pressed, resume drawing
    if (currentStroke && e.buttons === 1) {
      setIsDrawing(true);
    }
  }, [currentStroke]);

  // Clean up cursors older than 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updatedCursors = { ...userCursors };
      let hasChanges = false;

      Object.keys(updatedCursors).forEach(userId => {
        if (now - updatedCursors[userId].timestamp > 5000) {
          delete updatedCursors[userId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setUserCursors(updatedCursors);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userCursors]);

  return (
    <div className="canvas-container">
      <div className="canvas-header">
        <h2>Global Scribble Board</h2>
        <div className="user-info">
          <span>Welcome, {currentUser?.email}</span>
          <button 
            onClick={() => auth.signOut()}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="canvas-wrapper">
                     <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className="drawing-canvas"
          />
          
          {/* Render user cursors */}
          {Object.entries(userCursors).map(([uid, cursor]) => {
            if (uid === userId) return null;
            return (
              <div
                key={uid}
                className="user-cursor"
                style={{
                  left: cursor.x,
                  top: cursor.y
                }}
              >
                <div className="cursor-dot"></div>
                <div className="cursor-label">{cursor.email}</div>
              </div>
            );
          })}
        </div>
        
        <div className="sidebar">
          <div className="online-users">
            <h3>Online Users ({Object.keys(onlineUsers).length})</h3>
            <div className="users-list">
              {Object.entries(onlineUsers).map(([uid, user]) => (
                <div key={uid} className="user-item">
                  <img
                    className="user-avatar-img"
                    src={getAvatarUrl(user.avatarSeed || user.email || uid)}
                    alt={user.email}
                    width={32}
                    height={32}
                    loading="lazy"
                    decoding="async"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getAvatarUrl(String(Math.random()));
                    }}
                  />
                  <span className="user-email">{user.email}</span>
                </div>
              ))}
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  );
};

export default Canvas;

/**
 * Socket.IO real-time event handler.
 * Connects connected users, manages chat room joins, and relays messages.
 */
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    // Join a private conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId);
      }
    });

    // Real-time message relaying
    socket.on('send_message', (data) => {
      if (data && data.conversationId) {
        socket.to(data.conversationId).emit('new_message', data.message);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};

module.exports = socketHandler;

const HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Cloudflare AI Chat Assistant</title>
    <style>
      body { font-family: sans-serif; max-width: 700px; margin: 40px auto; }
      #chat { border: 1px solid #ddd; padding: 10px; height: 300px; overflow-y: auto; }
      .msg-user { color: #0b7285; }
      .msg-bot { color: #5c2d91; }
      #input-row { margin-top: 10px; display: flex; gap: 8px; }
      input { flex: 1; padding: 8px; }
      button { padding: 8px 16px; cursor: pointer; }
    </style>
  </head>
  <body>
    <h2>Cloudflare AI Chat Assistant</h2>
    <div id="chat"></div>

    <div id="input-row">
      <input id="input" placeholder="Type your message..." />
      <button id="sendBtn">Send</button>
    </div>

    <script>
      const session =
        (crypto.randomUUID && crypto.randomUUID()) ||
        Math.random().toString(36).slice(2);

      const chatDiv = document.getElementById('chat');
      const input = document.getElementById('input');
      const btn = document.getElementById('sendBtn');

      btn.onclick = send;
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') send();
      });

      function append(role, text) {
        const p = document.createElement('p');
        p.className = role === 'You' ? 'msg-user' : 'msg-bot';
        p.textContent = role + ': ' + text;
        chatDiv.appendChild(p);
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }

      async function send() {
        const message = input.value.trim();
        if (!message) return;
        append('You', message);
        input.value = '';

        const res = await fetch(window.location.pathname, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, session }),
        });

        const data = await res.json();
        append('Bot', data.reply);
      }
    </script>
  </body>
</html>`;

export default {
  async fetch(request, env) {
    // Serve the HTML UI
    if (request.method === 'GET') {
      return new Response(HTML, {
        headers: { 'content-type': 'text/html; charset=UTF-8' },
      });
    }

    // Handle chat requests
    if (request.method === 'POST') {
      const { message, session } = await request.json();

      const historyKey = `session:${session}`;
      const past =
        (await env.CHAT_HISTORY.get(historyKey, { type: 'json' })) || [];

      const chatHistory = [
        ...past,
        { role: 'user', content: message },
      ];

      // Call Workers AI – use a REAL model id from the catalog
      const aiResponse = await env.AI.run(
        '@cf/meta/llama-3.2-3b-instruct',
        { messages: chatHistory }
      );

      const botReply =
        aiResponse.output_text || aiResponse.response || 'No reply generated.';

      chatHistory.push({ role: 'assistant', content: botReply });

      await env.CHAT_HISTORY.put(historyKey, JSON.stringify(chatHistory));

      return Response.json({ reply: botReply });
    }

    return new Response('Method not allowed', { status: 405 });
  },
};

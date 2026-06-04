import {createFileRoute} from '@tanstack/react-router';

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>ztunes API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
      }

      .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        tryItOutEnabled: true,
      });
    </script>
  </body>
</html>
`;

export const Route = createFileRoute('/api/docs')({
  server: {
    handlers: {
      GET: () => {
        return new Response(html, {
          headers: {
            'content-type': 'text/html; charset=utf-8',
          },
        });
      },
    },
  },
});

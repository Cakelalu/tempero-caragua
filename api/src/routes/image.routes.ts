import express from 'express';

const router = express.Router();

router.get('/proxy', async (req, res) => {
    const imageUrl = req.query.url as string | undefined;


    if (!imageUrl) {
        return res.status(400).json({ error: 'Informe o parâmetro ?url=' });
    }

    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT!;

    if (!urlEndpoint || !imageUrl.startsWith(urlEndpoint)) {
        return res.status(403).json({ error: 'Domínio não permitido para proxy' });
    }

    try {
        const response = await fetch(imageUrl, { method: 'GET' });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Imagem não encontrada no ImageKit' });
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        res.send(buffer);
    } catch (err) {
        console.error('Erro ao buscar imagem pelo proxy:', err);
        res.status(500).json({ error: 'Erro ao buscar imagem pelo proxy' });
    }
});

export { router as imageRoutes };

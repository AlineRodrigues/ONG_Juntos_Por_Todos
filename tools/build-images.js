const fs = require('fs-extra');
const path = require('path');
// compat shim: some versions export as default
const imagemin = (require('imagemin') && require('imagemin').default) ? require('imagemin').default : require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
// compat shim: some versions export the plugin as default
const imageminSvgo = (require('imagemin-svgo') && require('imagemin-svgo').default) ? require('imagemin-svgo').default : require('imagemin-svgo');

async function buildImages() {
    console.log('🖼️  Iniciando otimização das imagens...');
    
    try {
        // Diretório de origem e destino
        const sourceDir = 'img';
        const outputDir = 'dist/img';
        
        // Verifica se o diretório de imagens existe
        if (!await fs.pathExists(sourceDir)) {
            console.log(`⚠️  Diretório ${sourceDir} não encontrado, pulando...`);
            return;
        }

        // Cria diretório de destino
        await fs.ensureDir(outputDir);

        // Lista todos os arquivos de imagem
        const files = await fs.readdir(sourceDir);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'].includes(ext);
        });

        if (imageFiles.length === 0) {
            console.log('⚠️  Nenhuma imagem encontrada para otimizar.');
            return;
        }

        console.log(`📁 Encontrados ${imageFiles.length} arquivo(s) de imagem para otimizar...`);

        // Configuração do imagemin para diferentes formatos
        const plugins = [
            // PNG com compressão otimizada
            imageminPngquant({
                quality: [0.6, 0.8],    // Qualidade entre 60-80%
                speed: 4,               // Velocidade de compressão (1-11)
                strip: true,            // Remove metadados
                dithering: 1,           // Dithering para melhor qualidade visual
            }),
            
            // SVG com otimizações agressivas mas seguras
            imageminSvgo({
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                // Preserva viewBox para responsividade
                                removeViewBox: false,
                                // Preserva IDs que podem ser usados por CSS/JS
                                cleanupIDs: false,
                                // Remove metadados desnecessários
                                removeMetadata: true,
                                // Remove comentários
                                removeComments: true,
                                // Remove atributos vazios
                                removeEmptyAttrs: true,
                                // Remove elementos vazios
                                removeEmptyContainers: true,
                                // Remove espaços desnecessários
                                removeEmptyText: true,
                                // Minifica estilos inline
                                minifyStyles: true,
                                // Remove doctype desnecessário
                                removeDoctype: true,
                                // Remove instruções de processamento XML
                                removeXMLProcInst: true,
                            },
                        },
                    },
                    // Remove atributos específicos que não são necessários
                    {
                        name: 'removeAttrs',
                        params: {
                            attrs: ['data-name', 'data-*']
                        }
                    }
                ],
            }),
        ];

        // Processa as imagens
        const result = await imagemin([`${sourceDir}/*`], {
            destination: outputDir,
            plugins: plugins,
            glob: true
        });

        // Calcula estatísticas de compressão
        let totalOriginalSize = 0;
        let totalOptimizedSize = 0;

        for (const file of result) {
            try {
                const originalPath = path.join(sourceDir, path.basename(file.sourcePath));
                const originalStats = await fs.stat(originalPath);
                const optimizedSize = file.data.length;
                
                totalOriginalSize += originalStats.size;
                totalOptimizedSize += optimizedSize;
                
                const savings = ((originalStats.size - optimizedSize) / originalStats.size * 100).toFixed(1);
                const originalKB = (originalStats.size / 1024).toFixed(1);
                const optimizedKB = (optimizedSize / 1024).toFixed(1);
                
                console.log(`✅ ${path.basename(file.sourcePath)}: ${originalKB}KB → ${optimizedKB}KB (${savings}% menor)`);
                
            } catch (error) {
                console.log(`✅ ${path.basename(file.sourcePath)}: otimizado`);
            }
        }

        // Estatísticas totais
        if (totalOriginalSize > 0) {
            const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
            const totalOriginalKB = (totalOriginalSize / 1024).toFixed(1);
            const totalOptimizedKB = (totalOptimizedSize / 1024).toFixed(1);
            
            console.log(`\n📊 Total: ${totalOriginalKB}KB → ${totalOptimizedKB}KB (${totalSavings}% de economia)`);
        }
        
        console.log('✨ Otimização das imagens concluída!');
        
    } catch (error) {
        console.error('❌ Erro durante a otimização das imagens:', error.message);
        
        // Fallback: copia as imagens originais se a otimização falhar
        console.log('🔄 Copiando imagens originais como fallback...');
        try {
            await fs.copy('img', 'dist/img');
            console.log('✅ Imagens copiadas com sucesso (sem otimização).');
        } catch (copyError) {
            console.error('❌ Erro ao copiar imagens:', copyError.message);
        }
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    buildImages().catch(console.error);
}

module.exports = buildImages;
const fs = require('fs-extra');
const path = require('path');
const CleanCSS = require('clean-css');

async function buildCSS() {
    console.log('🎨 Iniciando minificação do CSS...');
    
    const cssFiles = [
        { src: 'css/styles.css', dest: 'dist/css/styles.css' },
        { src: 'assets_a11y/a11y.css', dest: 'dist/assets_a11y/a11y.css' },
        { src: 'spa/css/styles.css', dest: 'dist/spa/css/styles.css' }
    ];

        // Configuração otimizada do CleanCSS
    const cleanCSS = new CleanCSS({
        level: 2, // Otimização máxima
        inline: ['remote'], // Insere folhas de estilo remotas inline
        rebase: false, // Não rebase URLs
        format: false, // Remove quebras de linha e espaços
        compatibility: 'ie11' // Compatibilidade com IE11+
    });

    for (const file of cssFiles) {
        try {
            // Verifica se o arquivo fonte existe
            if (!await fs.pathExists(file.src)) {
                console.log(`⚠️  Arquivo ${file.src} não encontrado, pulando...`);
                continue;
            }

            // Lê o arquivo CSS
            const cssContent = await fs.readFile(file.src, 'utf8');
            
            // Minifica o CSS
            const minified = cleanCSS.minify(cssContent);
            
            // Verifica se houve erros
            if (minified.errors.length > 0) {
                console.error(`❌ Erro ao minificar ${file.src}:`, minified.errors);
                continue;
            }

            // Cria diretório de destino se não existir
            await fs.ensureDir(path.dirname(file.dest));
            
            // Salva o arquivo minificado
            await fs.writeFile(file.dest, minified.styles);
            
            // Calcula economia de tamanho
            const originalSize = Buffer.byteLength(cssContent, 'utf8');
            const minifiedSize = Buffer.byteLength(minified.styles, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            
            console.log(`✅ ${file.src} → ${file.dest} (${savings}% menor)`);
            
            // Mostra warnings se houver
            if (minified.warnings.length > 0) {
                console.log(`⚠️  Warnings para ${file.src}:`, minified.warnings);
            }
            
        } catch (error) {
            console.error(`❌ Erro ao processar ${file.src}:`, error.message);
        }
    }
    
    console.log('✨ Minificação do CSS concluída!');
}

// Executa se chamado diretamente
if (require.main === module) {
    buildCSS().catch(console.error);
}

module.exports = buildCSS;
const fs = require('fs-extra');
const path = require('path');
const { minify } = require('html-minifier-terser');

async function buildHTML() {
    console.log('📄 Iniciando minificação do HTML...');
    
    const htmlFiles = [
        { src: 'index.html', dest: 'dist/index.html' },
        { src: 'cadastro.html', dest: 'dist/cadastro.html' },
        { src: 'projetos.html', dest: 'dist/projetos.html' },
        { src: 'sistema.html', dest: 'dist/sistema.html' },
        { src: 'test_functions.html', dest: 'dist/test_functions.html' },
        { src: 'spa/index.html', dest: 'dist/spa/index.html' }
    ];

    // Configuração otimizada do html-minifier-terser
    const minifierOptions = {
        // Minificação HTML
        collapseWhitespace: true,           // Remove espaços desnecessários
        removeComments: true,               // Remove comentários HTML
        removeRedundantAttributes: true,    // Remove atributos redundantes
        removeEmptyAttributes: true,        // Remove atributos vazios
        removeOptionalTags: true,           // Remove tags opcionais
        useShortDoctype: true,              // Usa DOCTYPE curto
        
        // Minificação CSS inline
        minifyCSS: true,                    // Minifica CSS inline
        
        // Minificação JS inline
        minifyJS: true,                     // Minifica JavaScript inline
        
        // URLs
        minifyURLs: true,                   // Minifica URLs
        
        // Atributos
        removeAttributeQuotes: true,        // Remove aspas desnecessárias
        removeEmptyElements: false,         // Mantém elementos vazios (podem ser importantes)
        
        // Performance
        caseSensitive: false,               // Não é case sensitive
        continueOnParseError: false,        // Para em caso de erro
        
        // Preserva funcionalidades importantes
        ignoreCustomComments: [
            /^\s*#/,                        // Preserva comentários que começam com #
        ],
        
        // Configurações específicas para SEO e acessibilidade
        keepClosingSlash: false,            // Remove barras de fechamento desnecessárias
        sortAttributes: true,               // Ordena atributos para melhor compressão
        sortClassName: true,                // Ordena classes CSS
    };

    for (const file of htmlFiles) {
        try {
            // Verifica se o arquivo fonte existe
            if (!await fs.pathExists(file.src)) {
                console.log(`⚠️  Arquivo ${file.src} não encontrado, pulando...`);
                continue;
            }

            // Lê o arquivo HTML
            const htmlContent = await fs.readFile(file.src, 'utf8');
            
            // Minifica o HTML
            const minified = await minify(htmlContent, minifierOptions);
            
            // Cria diretório de destino se não existir
            await fs.ensureDir(path.dirname(file.dest));
            
            // Salva o arquivo minificado
            await fs.writeFile(file.dest, minified);
            
            // Calcula economia de tamanho
            const originalSize = Buffer.byteLength(htmlContent, 'utf8');
            const minifiedSize = Buffer.byteLength(minified, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            
            console.log(`✅ ${file.src} → ${file.dest} (${savings}% menor)`);
            
        } catch (error) {
            console.error(`❌ Erro ao processar ${file.src}:`, error.message);
        }
    }
    
    console.log('✨ Minificação do HTML concluída!');
}

// Executa se chamado diretamente
if (require.main === module) {
    buildHTML().catch(console.error);
}

module.exports = buildHTML;
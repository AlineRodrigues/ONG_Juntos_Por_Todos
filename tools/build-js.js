const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');

async function buildJS() {
    console.log('⚡ Iniciando minificação do JavaScript...');
    
    const jsFiles = [
        { src: 'js/scripts.js', dest: 'dist/js/scripts.js' },
        { src: 'assets_a11y/a11y.js', dest: 'dist/assets_a11y/a11y.js' },
        { src: 'spa/js/app.js', dest: 'dist/spa/js/app.js' },
        { src: 'spa/js/data.js', dest: 'dist/spa/js/data.js' },
        { src: 'spa/js/templates.js', dest: 'dist/spa/js/templates.js' },
        { src: 'spa/js/validate.js', dest: 'dist/spa/js/validate.js' },
        { src: 'tools/test_cadastro.js', dest: 'dist/tools/test_cadastro.js' },
        { src: 'tests/interaction-test.js', dest: 'dist/tests/interaction-test.js' },
        { src: 'tests/jsdom-cadastro-only.js', dest: 'dist/tests/jsdom-cadastro-only.js' },
        { src: 'tests/jsdom-interactions.js', dest: 'dist/tests/jsdom-interactions.js' },
        { src: 'tests/jsdom-single.js', dest: 'dist/tests/jsdom-single.js' }
    ];

    // Configuração otimizada do Terser
    const terserOptions = {
        compress: {
            drop_console: true,        // Remove console.log() em produção
            drop_debugger: true,       // Remove debugger statements
            dead_code: true,           // Remove código morto
            unused: true,              // Remove variáveis não usadas
            pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove funções puras específicas
            passes: 2,                 // Múltiplas passadas para melhor otimização
        },
        mangle: {
            toplevel: false,           // Não mangle nomes globais para compatibilidade
            reserved: ['$', 'jQuery'], // Preserva nomes importantes
        },
        format: {
            comments: false,           // Remove comentários
            beautify: false,           // Minifica completamente
        },
        sourceMap: false,              // Sem source maps para produção
        ecma: 2018,                   // Target ES2018+ para melhor otimização
    };

    for (const file of jsFiles) {
        try {
            // Verifica se o arquivo fonte existe
            if (!await fs.pathExists(file.src)) {
                console.log(`⚠️  Arquivo ${file.src} não encontrado, pulando...`);
                continue;
            }

            // Lê o arquivo JavaScript
            const jsContent = await fs.readFile(file.src, 'utf8');
            
            // Minifica o JavaScript
            const result = await minify(jsContent, terserOptions);
            
            // Verifica se houve erro
            if (result.error) {
                console.error(`❌ Erro ao minificar ${file.src}:`, result.error);
                continue;
            }

            // Cria diretório de destino se não existir
            await fs.ensureDir(path.dirname(file.dest));
            
            // Salva o arquivo minificado
            await fs.writeFile(file.dest, result.code);
            
            // Calcula economia de tamanho
            const originalSize = Buffer.byteLength(jsContent, 'utf8');
            const minifiedSize = Buffer.byteLength(result.code, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            
            console.log(`✅ ${file.src} → ${file.dest} (${savings}% menor)`);
            
        } catch (error) {
            console.error(`❌ Erro ao processar ${file.src}:`, error.message);
        }
    }
    
    console.log('✨ Minificação do JavaScript concluída!');
}

// Executa se chamado diretamente
if (require.main === module) {
    buildJS().catch(console.error);
}

module.exports = buildJS;
const fs = require('fs-extra');
const path = require('path');

// Importa todos os scripts de build
const clean = require('./clean');
const buildCSS = require('./build-css');
const buildJS = require('./build-js');
const buildHTML = require('./build-html');
const buildImages = require('./build-images');

async function copyStaticFiles() {
    console.log('📁 Copiando arquivos estáticos...');
    
    const staticFiles = [
        // Arquivos de configuração e documentação
        { src: 'package.json', dest: 'dist/package.json' },
        { src: 'README.md', dest: 'dist/README.md' },
        { src: 'README_FINAL.md', dest: 'dist/README_FINAL.md' },
        { src: 'FUNCIONANDO.md', dest: 'dist/FUNCIONANDO.md' },
        
        // Diretório releases completo
        { src: 'releases/', dest: 'dist/releases/', isDir: true },
    ];

    for (const file of staticFiles) {
        try {
            if (!await fs.pathExists(file.src)) {
                console.log(`⚠️  ${file.src} não encontrado, pulando...`);
                continue;
            }

            if (file.isDir) {
                await fs.copy(file.src, file.dest);
                console.log(`✅ Diretório copiado: ${file.src} → ${file.dest}`);
            } else {
                await fs.copy(file.src, file.dest);
                console.log(`✅ Arquivo copiado: ${file.src} → ${file.dest}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao copiar ${file.src}:`, error.message);
        }
    }
}

async function generateBuildInfo() {
    console.log('📋 Gerando informações do build...');
    
    const buildInfo = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        buildType: 'production',
        optimizations: {
            html: 'Minificado com html-minifier-terser',
            css: 'Minificado com clean-css',
            javascript: 'Minificado com terser',
            images: 'Otimizado com imagemin (PNG e SVG)',
        },
        performance: {
            description: 'Build otimizado para produção',
            features: [
                'Remoção de console.log() em JavaScript',
                'Compressão de CSS com nível 2',
                'Minificação agressiva de HTML',
                'Otimização de imagens PNG e SVG',
                'Remoção de comentários e espaços desnecessários'
            ]
        },
        deployment: {
            ready: true,
            server: 'Compatível com qualquer servidor HTTP estático',
            commands: {
                preview: 'npm run prod',
                serve: 'npx http-server dist -p 3001'
            }
        }
    };

    await fs.writeFile(
        'dist/build-info.json', 
        JSON.stringify(buildInfo, null, 2)
    );
    
    console.log('✅ build-info.json criado em dist/');
}

async function validateBuild() {
    console.log('🔍 Validando build...');
    
    const criticalFiles = [
        'dist/index.html',
        'dist/css/styles.css',
        'dist/js/scripts.js',
        'dist/package.json'
    ];

    let allValid = true;
    
    for (const file of criticalFiles) {
        if (!await fs.pathExists(file)) {
            console.error(`❌ Arquivo crítico não encontrado: ${file}`);
            allValid = false;
        } else {
            const stats = await fs.stat(file);
            if (stats.size === 0) {
                console.error(`❌ Arquivo vazio: ${file}`);
                allValid = false;
            } else {
                console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
            }
        }
    }
    
    if (!allValid) {
        throw new Error('Build inválido: arquivos críticos ausentes ou vazios');
    }
    
    console.log('✅ Build validado com sucesso!');
    return true;
}

async function showBuildSummary() {
    console.log('\n📊 RESUMO DO BUILD');
    console.log('==================');
    
    try {
        // Calcula tamanho total dos arquivos
        const distStats = await fs.stat('dist');
        console.log(`📁 Diretório: dist/`);
        console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
        
        // Lista arquivos principais e seus tamanhos
        const mainFiles = [
            'dist/index.html',
            'dist/cadastro.html', 
            'dist/projetos.html',
            'dist/sistema.html',
            'dist/css/styles.css',
            'dist/js/scripts.js'
        ];
        
        console.log('\n📄 Arquivos principais:');
        for (const file of mainFiles) {
            if (await fs.pathExists(file)) {
                const stats = await fs.stat(file);
                const sizeKB = (stats.size / 1024).toFixed(1);
                console.log(`   ${path.basename(file)}: ${sizeKB}KB`);
            }
        }
        
        console.log('\n🚀 Para testar o build:');
        console.log('   npm run prod');
        console.log('   ou: npx http-server dist -p 3001');
        
        console.log('\n✨ Build de produção concluído com sucesso!');
        
    } catch (error) {
        console.log('\n✨ Build concluído!');
    }
}

async function build() {
    const startTime = Date.now();
    
    console.log('🚀 INICIANDO BUILD DE PRODUÇÃO');
    console.log('===============================\n');
    
    try {
        // 1. Limpeza
        await clean();
        console.log('');
        
        // 2. Processamento em paralelo dos assets
        console.log('⚡ Executando otimizações em paralelo...\n');
        await Promise.all([
            buildCSS(),
            buildJS(), 
            buildImages()
        ]);
        console.log('');
        
        // 3. HTML (depois do CSS/JS para garantir que existam)
        await buildHTML();
        console.log('');
        
        // 4. Arquivos estáticos
        await copyStaticFiles();
        console.log('');
        
        // 5. Informações do build
        await generateBuildInfo();
        console.log('');
        
        // 6. Validação
        await validateBuild();
        
        // 7. Resumo
        const endTime = Date.now();
        const buildTime = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`\n⏱️  Tempo total: ${buildTime}s`);
        
        await showBuildSummary();
        
    } catch (error) {
        console.error('\n❌ ERRO NO BUILD:', error.message);
        console.error('\n🔧 Verifique se todas as dependências estão instaladas:');
        console.error('   npm install');
        process.exit(1);
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    build().catch(console.error);
}

module.exports = build;
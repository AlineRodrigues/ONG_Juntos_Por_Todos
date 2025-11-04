const fs = require('fs-extra');
const path = require('path');

async function clean() {
    console.log('🧹 Limpando diretório de build...');
    
    const distDir = 'dist';
    
    try {
        // Verifica se o diretório dist existe
        if (await fs.pathExists(distDir)) {
            // Remove todo o conteúdo do diretório dist
            await fs.remove(distDir);
            console.log(`✅ Diretório ${distDir} removido com sucesso.`);
        } else {
            console.log(`⚠️  Diretório ${distDir} não existe.`);
        }
        
        // Recria o diretório dist vazio
        await fs.ensureDir(distDir);
        console.log(`✅ Diretório ${distDir} criado.`);
        
        console.log('✨ Limpeza concluída!');
        
    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error.message);
        throw error;
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    clean().catch(console.error);
}

module.exports = clean;
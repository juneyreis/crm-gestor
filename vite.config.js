import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente corretamente
  const env = loadEnv(mode, process.cwd(), '');
  
  // Usa VITE_DEPLOY_TARGET se definido, padrão é 'vercel'
  const deployTarget = env.VITE_DEPLOY_TARGET || 'vercel';
  
  // Define base path baseado no target
  const base = deployTarget === 'github' ? '/visitasweb/' : '/';

  return {
    plugins: [react()],
    base,
    
    // Configurações adicionais de build
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
    
    // Configurações do servidor de desenvolvimento
    server: {
      port: 5173,
      open: true,
    },
    
    // Configurações de preview
    preview: {
      port: 4173,
      open: true,
    }
  };
});
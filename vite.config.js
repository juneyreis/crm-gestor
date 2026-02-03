import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente corretamente
  const env = loadEnv(mode, process.cwd(), '');
  
  // Usa VITE_DEPLOY_TARGET se definido, padrão é 'vercel'
  const deployTarget = env.VITE_DEPLOY_TARGET || 'vercel';
  
  // Define base path baseado no target - CORREÇÃO AQUI!
  // String vazia para Vercel, '/crm-gestor/' para GitHub
  const base = deployTarget === 'github' ? '/crm-gestor/' : '';

  return {
    plugins: [react()],
    base, // Será '' para Vercel e '/crm-gestor/' para GitHub
    
    // Configurações adicionais de build
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      // Otimizações para melhor performance
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'recharts', '@tanstack/react-table'],
            utils: ['date-fns', 'papaparse', '@supabase/supabase-js']
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      },
      // Otimização de chunks
      chunkSizeWarningLimit: 1000
    },
    
    // Configurações do servidor de desenvolvimento
    server: {
      port: 5173,
      open: true,
      host: true
    },
    
    // Configurações de preview
    preview: {
      port: 4173,
      open: true,
      host: true
    }
  };
});
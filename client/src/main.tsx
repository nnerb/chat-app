import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import UnderConstruction from './components/under-construction'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        {/* <App />  */}
        <UnderConstruction />
        <ReactQueryDevtools initialIsOpen={false}/>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

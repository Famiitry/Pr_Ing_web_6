import { useState } from 'react'

export default function TokenStrip({ token }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* el portapapeles puede no estar disponible; la insignia sigue siendo copiable a mano */
    }
  }

  return (
    <div className="sk-token">
      <span className="sk-label sk-token__label">Token (24 h)</span>
      <code>{token}</code>
      <button type="button" className="sk-token__copy" onClick={copy}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
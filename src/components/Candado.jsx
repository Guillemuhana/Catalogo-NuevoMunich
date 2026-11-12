import { useState } from 'react'

const CLAVE = '4056'
const LLAVE = 'munich-acceso'

function yaEntro() {
  try { return sessionStorage.getItem(LLAVE) === 'ok' } catch { return false }
}

export default function Candado({ children }) {
  const [abierto, setAbierto] = useState(yaEntro)
  const [valor, setValor] = useState('')
  const [error, setError] = useState(false)

  if (abierto) return children

  const cambiar = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
    setValor(v)
    setError(false)
    if (v.length === 4) {
      if (v === CLAVE) {
        try { sessionStorage.setItem(LLAVE, 'ok') } catch { /* sin storage */ }
        setAbierto(true)
      } else {
        setError(true)
        setTimeout(() => setValor(''), 400)
      }
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-humo px-4 text-crema">
      <img src="/img/marca/logo.webp" alt="Nuevo Munich" className="w-40 max-w-[60vw]" />
      <label className="flex flex-col items-center gap-4">
        <span className="font-display text-2xl">Ingresá la contraseña</span>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={valor}
          onChange={cambiar}
          maxLength={4}
          className={`w-44 rounded-lg border bg-carbon py-3 text-center text-3xl tracking-[0.6em] outline-none transition-colors ${
            error ? 'border-munich' : 'border-roble focus:border-oro'
          }`}
        />
        <span className={`h-5 text-sm text-munich ${error ? '' : 'invisible'}`}>Contraseña incorrecta</span>
      </label>
    </div>
  )
}

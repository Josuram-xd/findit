'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'persona'
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', nombre: '' })
  const supabase = createClient()
  const esOrg = tipo === 'organizacion'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (modo === 'registro') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { nombre: form.nombre, tipo } }
        })
        if (error) throw error
        router.push(esOrg ? '/dashboard/org/setup' : '/dashboard')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0f1e',
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid #1e293b',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.5px' }}>
            Find<span style={{ color: '#6366f1' }}>It</span>
          </span>
        </Link>
        <span style={{
          background: esOrg ? '#1e1b4b' : '#0f2a1e',
          border: `1px solid ${esOrg ? '#3730a3' : '#166534'}`,
          color: esOrg ? '#818cf8' : '#4ade80',
          borderRadius: '100px',
          padding: '4px 14px',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {esOrg ? 'Modo Organizacion' : 'Modo Persona'}
        </span>
      </nav>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        gap: '80px',
      }}>
        {/* Left: Info */}
        <div style={{ maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h1 style={{
              fontSize: '40px',
              fontWeight: '800',
              color: '#f1f5f9',
              lineHeight: '1.1',
              letterSpacing: '-1.5px',
              marginBottom: '16px',
            }}>
              {modo === 'login' ? 'Bienvenido de vuelta' : esOrg ? 'Registra tu organizacion' : 'Crea tu cuenta'}
            </h1>
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.7' }}>
              {esOrg
                ? 'Crea un espacio privado para que tu comunidad reporte y encuentre objetos perdidos.'
                : 'Unete a tu organizacion y empieza a reportar o buscar tus objetos perdidos.'}
            </p>
          </div>

          {/* Features */}
          {[
            { title: 'Privado y seguro', desc: 'Solo miembros de tu organizacion pueden ver las publicaciones' },
            { title: 'Fotos incluidas', desc: 'Adjunta imagenes para identificar objetos facilmente' },
            { title: 'Resolucion rapida', desc: 'Marca objetos como encontrados cuando se recuperen' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', minWidth: '32px',
                background: '#1e1b4b', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{f.title}</p>
                <p style={{ color: '#475569', fontSize: '13px' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Form */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
        }}>
          {/* Toggle */}
          <div style={{
            display: 'flex',
            background: '#0a0f1e',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '32px',
            border: '1px solid #1e293b',
          }}>
            {(['login', 'registro'] as const).map(m => (
              <button key={m} onClick={() => setModo(m)} style={{
                flex: 1, padding: '9px',
                borderRadius: '8px',
                background: modo === m ? '#6366f1' : 'transparent',
                color: modo === m ? 'white' : '#475569',
                fontSize: '13px', fontWeight: '600', border: 'none',
                cursor: 'pointer',
              }}>
                {m === 'login' ? 'Iniciar sesion' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {modo === 'registro' && (
              <div>
                <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  {esOrg ? 'NOMBRE DE LA ORGANIZACION' : 'TU NOMBRE'}
                </label>
                <input
                  type="text"
                  placeholder={esOrg ? 'Ej: Universidad Nacional' : 'Ej: Juan Perez'}
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: '#0a0f1e', border: '1px solid #1e293b',
                    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                CORREO ELECTRONICO
              </label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%', padding: '12px 16px',
                  background: '#0a0f1e', border: '1px solid #1e293b',
                  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                CONTRASENA
              </label>
              <input
                type="password"
                placeholder="Minimo 6 caracteres"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required minLength={6}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: '#0a0f1e', border: '1px solid #1e293b',
                  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#1c0a0a', border: '1px solid #7f1d1d',
                borderRadius: '10px', padding: '12px 16px',
                color: '#fca5a5', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? '#4338ca80' : '#6366f1',
              color: 'white', padding: '13px',
              borderRadius: '10px', fontSize: '14px', fontWeight: '700',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}>
              {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/" style={{ color: '#334155', fontSize: '13px', textDecoration: 'none' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OrgSetup() {
  const [form, setForm] = useState({ nombre: '', descripcion: '', direccion: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { error } = await supabase.from('organizations').insert({
        nombre: form.nombre,
        descripcion: form.descripcion,
        direccion: form.direccion,
        created_by: user.id,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', padding: '20px 48px',
        borderBottom: '1px solid #1e293b',
      }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>
          Find<span style={{ color: '#6366f1' }}>It</span>
        </span>
      </nav>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px',
      }}>
        <div style={{
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: '20px', padding: '48px', width: '100%', maxWidth: '480px',
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              Configura tu organizacion
            </h1>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Este sera el espacio donde tu comunidad reportara objetos perdidos
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                NOMBRE DE LA ORGANIZACION *
              </label>
              <input
                type="text"
                placeholder="Ej: Universidad Nacional, Empresa XYZ"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
                style={{
                  width: '100%', padding: '12px 16px', background: '#0a0f1e',
                  border: '1px solid #1e293b', borderRadius: '10px',
                  color: '#f1f5f9', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                DESCRIPCION
              </label>
              <textarea
                placeholder="Describe brevemente tu organizacion..."
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '12px 16px', background: '#0a0f1e',
                  border: '1px solid #1e293b', borderRadius: '10px',
                  color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  resize: 'none', fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                DIRECCION O UBICACION
              </label>
              <input
                type="text"
                placeholder="Ej: Calle 45 # 12-34, Bogota"
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                style={{
                  width: '100%', padding: '12px 16px', background: '#0a0f1e',
                  border: '1px solid #1e293b', borderRadius: '10px',
                  color: '#f1f5f9', fontSize: '14px', outline: 'none',
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
              color: 'white', padding: '13px', borderRadius: '10px',
              fontSize: '14px', fontWeight: '700', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
            }}>
              {loading ? 'Creando...' : 'Crear organizacion'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
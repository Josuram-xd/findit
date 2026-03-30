'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  nombre: string
  tipo: string
  contacto: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ nombre: '', contacto: '' })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setForm({ nombre: data.nombre || '', contacto: data.contacto || '' })
      if (data.avatar_url) setPreview(data.avatar_url)
    }
    setLoading(false)
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      let avatar_url = profile?.avatar_url || null

      if (avatar) {
        const ext = avatar.name.split('.').pop()
        const filename = `avatars/${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('items')
          .upload(filename, avatar, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('items').getPublicUrl(filename)
        avatar_url = urlData.publicUrl
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          nombre: form.nombre,
          contacto: form.contacto || null,
          avatar_url,
        })
        .eq('id', user.id)

      if (error) throw error
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Detect contact type for hint
  const getContactHint = (c: string) => {
    if (!c) return null
    if (c.includes('@')) return { text: 'Se mostrará como correo electrónico', color: '#818cf8' }
    if (c.startsWith('+') || /^\d{7,}$/.test(c.replace(/\s/g, '')))
      return { text: 'Se mostrará como enlace de WhatsApp', color: '#4ade80' }
    if (c.startsWith('http')) return { text: 'Se mostrará como enlace externo', color: '#38bdf8' }
    return { text: 'Se mostrará como texto de contacto', color: '#94a3b8' }
  }

  const hint = getContactHint(form.contacto)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#475569' }}>Cargando...</p>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid #1e293b',
      }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>
          Find<span style={{ color: '#6366f1' }}>It</span>
        </span>
        <Link href="/dashboard" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>
          ← Volver al dashboard
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              Mi perfil
            </h1>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Tu informacion visible para otros usuarios al publicar objetos
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar"
                    style={{
                      width: '96px', height: '96px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid #1e293b',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '96px', height: '96px', borderRadius: '50%',
                    background: '#1e1b4b', border: '3px solid #1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                {/* Edit overlay */}
                <label style={{
                  position: 'absolute', bottom: '0', right: '0',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#6366f1', border: '2px solid #0a0f1e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
                </label>
              </div>
              <p style={{ color: '#334155', fontSize: '12px' }}>Click en el icono para cambiar foto</p>
            </div>

            {/* Nombre */}
            <div>
              <label style={{
                color: '#64748b', fontSize: '12px', fontWeight: '600',
                letterSpacing: '0.5px', display: 'block', marginBottom: '8px',
              }}>
                NOMBRE
              </label>
              <input
                type="text"
                placeholder="Tu nombre o el de tu organización"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f172a',
                  border: '1px solid #1e293b', borderRadius: '10px',
                  color: '#f1f5f9', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            {/* Tipo (read-only) */}
            <div>
              <label style={{
                color: '#64748b', fontSize: '12px', fontWeight: '600',
                letterSpacing: '0.5px', display: 'block', marginBottom: '8px',
              }}>
                TIPO DE CUENTA
              </label>
              <div style={{
                padding: '12px 16px', background: '#0f172a',
                border: '1px solid #1e293b', borderRadius: '10px',
                color: '#475569', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{
                  background: profile?.tipo === 'organizacion' ? '#1e1b4b' : '#0f2a1e',
                  color: profile?.tipo === 'organizacion' ? '#818cf8' : '#4ade80',
                  border: `1px solid ${profile?.tipo === 'organizacion' ? '#3730a3' : '#166534'}`,
                  borderRadius: '100px', padding: '2px 10px', fontSize: '11px', fontWeight: '700',
                }}>
                  {profile?.tipo === 'organizacion' ? 'Organización' : 'Persona'}
                </span>
                <span style={{ color: '#334155', fontSize: '12px' }}>No se puede cambiar</span>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <label style={{
                color: '#64748b', fontSize: '12px', fontWeight: '600',
                letterSpacing: '0.5px', display: 'block', marginBottom: '8px',
              }}>
                METODO DE CONTACTO
              </label>
              <input
                type="text"
                placeholder="correo@email.com · +573001234567 · https://..."
                value={form.contacto}
                onChange={e => setForm({ ...form, contacto: e.target.value })}
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f172a',
                  border: `1px solid ${hint ? '#334155' : '#1e293b'}`, borderRadius: '10px',
                  color: '#f1f5f9', fontSize: '14px', outline: 'none',
                }}
              />
              {/* Dynamic hint */}
              {hint && (
                <div style={{
                  marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: hint.color }} />
                  <p style={{ color: hint.color, fontSize: '12px' }}>{hint.text}</p>
                </div>
              )}
              {!form.contacto && (
                <p style={{ color: '#334155', fontSize: '12px', marginTop: '8px' }}>
                  Puedes poner tu correo, numero de WhatsApp o cualquier enlace de contacto
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#1c0a0a', border: '1px solid #7f1d1d',
                borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                background: '#052e16', border: '1px solid #166534',
                borderRadius: '10px', padding: '12px 16px', color: '#4ade80', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Perfil actualizado correctamente
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving ? '#4338ca80' : '#6366f1',
                color: 'white', padding: '13px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '700', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
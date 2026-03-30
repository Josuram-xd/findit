'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
  id: string
  nombre: string
}

export default function NewItem() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    estado: 'perdido',
    categoria: '',
    organization_id: '',
  })
  const [imagen, setImagen] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const categorias = [
    'Electronico', 'Ropa', 'Accesorio', 'Documento', 
    'Llave', 'Bolso / Mochila', 'Libro', 'Otro'
  ]

  useEffect(() => {
    loadOrgs()
  }, [])

  const loadOrgs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: profile } = await supabase
      .from('profiles').select('tipo').eq('id', user.id).single()

    if (profile?.tipo === 'organizacion') {
      const { data } = await supabase
        .from('organizations').select('id, nombre').eq('created_by', user.id)
      if (data) { setOrgs(data); setForm(f => ({ ...f, organization_id: data[0]?.id || '' })) }
    } else {
      const { data: memberships } = await supabase
        .from('memberships')
        .select('organization_id, organizations(id, nombre)')
        .eq('user_id', user.id)
      if (memberships) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userOrgs = memberships.map((m: any) => m.organizations)
        setOrgs(userOrgs)
        setForm(f => ({ ...f, organization_id: userOrgs[0]?.id || '' }))
      }
    }
  }

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagen(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      let imagen_url = null

      if (imagen) {
        const ext = imagen.name.split('.').pop()
        const filename = `${user.id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('items')
          .upload(filename, imagen)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('items').getPublicUrl(filename)
        imagen_url = urlData.publicUrl
      }

      const { error } = await supabase.from('items').insert({
        titulo: form.titulo,
        descripcion: form.descripcion,
        estado: form.estado,
        categoria: form.categoria,
        organization_id: form.organization_id,
        user_id: user.id,
        imagen_url,
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

      <div style={{
        flex: 1, display: 'flex', justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              Publicar objeto
            </h1>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Completa la informacion para que otros puedan identificarlo
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Estado */}
            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                TIPO DE PUBLICACION
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['perdido', 'encontrado'].map(e => (
                  <button key={e} type="button" onClick={() => setForm({ ...form, estado: e })} style={{
                    flex: 1, padding: '12px',
                    borderRadius: '10px', cursor: 'pointer',
                    fontWeight: '700', fontSize: '14px',
                    background: form.estado === e
                      ? (e === 'perdido' ? '#450a0a' : '#052e16')
                      : '#0f172a',
                    color: form.estado === e
                      ? (e === 'perdido' ? '#fca5a5' : '#4ade80')
                      : '#475569',
                    border: form.estado === e
                      ? `1px solid ${e === 'perdido' ? '#7f1d1d' : '#166534'}`
                      : '1px solid #1e293b',
                  }}>
                    {e === 'perdido' ? 'Lo perdi' : 'Lo encontre'}
                  </button>
                ))}
              </div>
            </div>

            {/* Organizacion */}
            {orgs.length > 1 && (
              <div>
                <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  ORGANIZACION
                </label>
                <select
                  value={form.organization_id}
                  onChange={e => setForm({ ...form, organization_id: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 16px', background: '#0f172a',
                    border: '1px solid #1e293b', borderRadius: '10px',
                    color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                >
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </select>
              </div>
            )}

            {/* Titulo */}
            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                TITULO *
              </label>
              <input
                type="text"
                placeholder="Ej: Celular Samsung negro, Mochila azul con libros..."
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                required
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f172a',
                  border: '1px solid #1e293b', borderRadius: '10px',
                  color: '#f1f5f9', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            {/* Descripcion */}
            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                DESCRIPCION *
              </label>
              <textarea
                placeholder="Describe el objeto con el mayor detalle posible: color, marca, donde lo perdiste, cuando..."
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                required rows={4}
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f172a',
                  border: '1px solid #1e293b', borderRadius: '10px',
                  color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  resize: 'none', fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Categoria */}
            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                CATEGORIA *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categorias.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, categoria: c })} style={{
                    padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '500',
                    background: form.categoria === c ? '#6366f1' : '#0f172a',
                    color: form.categoria === c ? 'white' : '#475569',
                    border: form.categoria === c ? '1px solid #6366f1' : '1px solid #1e293b',
                  }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                FOTO DEL OBJETO (opcional)
              </label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '32px', borderRadius: '12px',
                border: '2px dashed #1e293b', cursor: 'pointer', background: '#0f172a',
              }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{
                    maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', objectFit: 'cover'
                  }} />
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p style={{ color: '#334155', fontSize: '14px' }}>Click para subir una foto</p>
                    <p style={{ color: '#1e293b', fontSize: '12px', marginTop: '4px' }}>JPG, PNG hasta 5MB</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
              </label>
            </div>

            {error && (
              <div style={{
                background: '#1c0a0a', border: '1px solid #7f1d1d',
                borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !form.categoria} style={{
              background: loading || !form.categoria ? '#4338ca40' : '#6366f1',
              color: 'white', padding: '14px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700', border: 'none',
              cursor: loading || !form.categoria ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Publicando...' : 'Publicar objeto'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
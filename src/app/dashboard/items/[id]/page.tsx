'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Item {
  id: string
  titulo: string
  descripcion: string
  estado: string
  categoria: string
  resuelto: boolean
  created_at: string
  imagen_url: string
  user_id: string
  organization_id: string
  profiles: { nombre: string; id: string; contacto: string | null }
  organizations: { nombre: string; created_by: string }
}

const categorias = [
  'Electronico', 'Ropa', 'Accesorio', 'Documento',
  'Llave', 'Bolso / Mochila', 'Libro', 'Otro'
]

export default function ItemDetail() {
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOrgAdmin, setIsOrgAdmin] = useState(false)
  const [editForm, setEditForm] = useState({ titulo: '', descripcion: '', estado: '', categoria: '' })
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => { loadItem() }, [])

  const loadItem = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('items')
      .select('*, profiles(nombre, id, contacto), organizations(nombre, created_by)')
      .eq('id', params.id)
      .single()

    if (error || !data) { router.push('/dashboard'); return }
    setItem(data)
    setEditForm({
      titulo: data.titulo,
      descripcion: data.descripcion,
      estado: data.estado,
      categoria: data.categoria,
    })
    if (data.organizations?.created_by === user.id) setIsOrgAdmin(true)
    setLoading(false)
  }

  const toggleResuelto = async () => {
    if (!item) return
    setResolving(true)
    const nuevoEstado = !item.resuelto
    const { error } = await supabase
      .from('items').update({ resuelto: nuevoEstado }).eq('id', item.id)
    if (!error) setItem({ ...item, resuelto: nuevoEstado })
    setResolving(false)
  }

  const guardarEdicion = async () => {
    if (!item) return
    setSaving(true)
    const { error } = await supabase
      .from('items')
      .update({
        titulo: editForm.titulo,
        descripcion: editForm.descripcion,
        estado: editForm.estado,
        categoria: editForm.categoria,
      })
      .eq('id', item.id)
    if (!error) {
      setItem({ ...item, ...editForm })
      setEditing(false)
    }
    setSaving(false)
  }

  const borrarItem = async () => {
    if (!item || !confirm('¿Seguro que quieres borrar esta publicación?')) return
    setDeleting(true)
    await supabase.from('items').delete().eq('id', item.id)
    router.push('/dashboard')
  }

  const esAutor = currentUserId === item?.user_id
  const puedeBorrar = esAutor || isOrgAdmin
  const puedeVerContacto = !esAutor

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#475569' }}>Cargando...</p>
    </div>
  )

  if (!item) return null

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

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '680px' }}>

          {/* Badges + acciones */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                background: item.estado === 'perdido' ? '#450a0a' : '#052e16',
                color: item.estado === 'perdido' ? '#fca5a5' : '#4ade80',
                border: `1px solid ${item.estado === 'perdido' ? '#7f1d1d' : '#166534'}`,
                padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700',
              }}>
                {item.estado === 'perdido' ? '🔍 PERDIDO' : '📦 ENCONTRADO'}
              </span>
              <span style={{ background: '#1e293b', color: '#64748b', padding: '4px 14px', borderRadius: '100px', fontSize: '12px' }}>
                {item.categoria}
              </span>
              {item.resuelto && (
                <span style={{ background: '#1e1b4b', color: '#818cf8', border: '1px solid #3730a3', padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
                  ✓ RESUELTO
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {esAutor && !item.resuelto && (
                <button onClick={() => setEditing(!editing)} style={{
                  background: 'transparent', border: '1px solid #334155',
                  color: '#94a3b8', padding: '7px 16px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}>
                  {editing ? 'Cancelar' : '✏️ Editar'}
                </button>
              )}
              {puedeBorrar && (
                <button onClick={borrarItem} disabled={deleting} style={{
                  background: 'transparent', border: '1px solid #7f1d1d',
                  color: '#fca5a5', padding: '7px 16px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}>
                  {deleting ? 'Borrando...' : '🗑 Borrar'}
                </button>
              )}
            </div>
          </div>

          {/* Modo edición */}
          {editing ? (
            <div style={{ background: '#0f172a', border: '1px solid #3730a3', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
              <h2 style={{ color: '#818cf8', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px' }}>
                EDITANDO PUBLICACIÓN
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>TIPO</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['perdido', 'encontrado'].map(e => (
                    <button key={e} type="button" onClick={() => setEditForm({ ...editForm, estado: e })} style={{
                      flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
                      fontWeight: '700', fontSize: '13px',
                      background: editForm.estado === e ? (e === 'perdido' ? '#450a0a' : '#052e16') : '#0a0f1e',
                      color: editForm.estado === e ? (e === 'perdido' ? '#fca5a5' : '#4ade80') : '#475569',
                      border: editForm.estado === e ? `1px solid ${e === 'perdido' ? '#7f1d1d' : '#166534'}` : '1px solid #1e293b',
                    }}>
                      {e === 'perdido' ? 'Lo perdí' : 'Lo encontré'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>TÍTULO</label>
                <input
                  value={editForm.titulo}
                  onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>DESCRIPCIÓN</label>
                <textarea
                  value={editForm.descripcion}
                  onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '12px 16px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>CATEGORÍA</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categorias.map(c => (
                    <button key={c} type="button" onClick={() => setEditForm({ ...editForm, categoria: c })} style={{
                      padding: '7px 14px', borderRadius: '100px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '500',
                      background: editForm.categoria === c ? '#6366f1' : '#0a0f1e',
                      color: editForm.categoria === c ? 'white' : '#475569',
                      border: editForm.categoria === c ? '1px solid #6366f1' : '1px solid #1e293b',
                    }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={guardarEdicion} disabled={saving} style={{
                background: saving ? '#4338ca80' : '#6366f1', color: 'white',
                padding: '12px 28px', borderRadius: '10px', fontSize: '14px',
                fontWeight: '700', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ color: '#f1f5f9', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '16px' }}>
                {item.titulo}
              </h1>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <span style={{ color: '#475569', fontSize: '13px' }}>📍 {item.organizations?.nombre}</span>
                <span style={{ color: '#475569', fontSize: '13px' }}>👤 {item.profiles?.nombre}</span>
                <span style={{ color: '#475569', fontSize: '13px' }}>
                  🗓 {new Date(item.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {item.imagen_url && (
                <div style={{ marginBottom: '32px' }}>
                  <img src={item.imagen_url} alt={item.titulo} style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #1e293b' }} />
                </div>
              )}

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px' }}>DESCRIPCIÓN</h2>
                <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{item.descripcion}</p>
              </div>
            </>
          )}

          {/* Contacto para otros usuarios */}
          {puedeVerContacto && !item.resuelto && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {item.estado === 'perdido' ? '¿Encontraste este objeto?' : '¿Es tuyo este objeto?'}
                  </p>
                  <p style={{ color: '#475569', fontSize: '13px' }}>
                    Contacta a <strong style={{ color: '#94a3b8' }}>{item.profiles?.nombre}</strong> para coordinar
                  </p>
                </div>
                <button onClick={() => setShowContact(!showContact)} style={{
                  background: '#1e1b4b', border: '1px solid #3730a3', color: '#818cf8',
                  padding: '10px 24px', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {showContact ? 'Ocultar' : '💬 Ver contacto'}
                </button>
              </div>

              {showContact && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
                  {item.profiles?.contacto ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{
                        background: '#0a0f1e', border: '1px solid #3730a3',
                        borderRadius: '10px', padding: '12px 20px',
                        color: '#c7d2fe', fontSize: '15px', fontWeight: '600',
                        flex: 1, minWidth: '200px',
                      }}>
                        {item.profiles.contacto}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(item.profiles.contacto!)}
                        style={{
                          background: '#1e1b4b', border: '1px solid #3730a3',
                          color: '#818cf8', padding: '12px 20px', borderRadius: '10px',
                          fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
                      <p style={{ color: '#475569', fontSize: '13px' }}>
                        <strong style={{ color: '#64748b' }}>{item.profiles?.nombre}</strong> no ha configurado un método de contacto aún.
                        Puedes buscarlo directamente en <strong style={{ color: '#64748b' }}>{item.organizations?.nombre}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Aviso al autor si no tiene contacto */}
          {esAutor && !item.profiles?.contacto && !item.resuelto && (
            <div style={{ background: '#0f172a', border: '1px solid #78350f', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              <p style={{ color: '#fbbf24', fontSize: '13px' }}>
                No tienes método de contacto configurado. Otros usuarios no podrán contactarte fácilmente.{' '}
                <Link href="/dashboard/profile" style={{ color: '#f59e0b', fontWeight: '700' }}>
                  Configurar ahora →
                </Link>
              </p>
            </div>
          )}

          {/* Toggle resuelto — solo autor */}
          {esAutor && (
            <div style={{
              background: item.resuelto ? '#1e1b4b' : '#0f172a',
              border: `1px solid ${item.resuelto ? '#3730a3' : '#1e293b'}`,
              borderRadius: '16px', padding: '24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
            }}>
              <div>
                <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                  {item.resuelto ? '✓ Este objeto fue recuperado' : '¿Ya se resolvió?'}
                </p>
                <p style={{ color: item.resuelto ? '#4338ca' : '#475569', fontSize: '13px' }}>
                  {item.resuelto
                    ? 'Puedes desmarcarlo si fue un error'
                    : 'Marca esta publicación como resuelta para avisar a la comunidad'}
                </p>
              </div>
              <button onClick={toggleResuelto} disabled={resolving} style={{
                background: item.resuelto ? 'transparent' : '#052e16',
                border: item.resuelto ? '1px solid #3730a3' : '1px solid #166534',
                color: item.resuelto ? '#818cf8' : '#4ade80',
                padding: '10px 24px', borderRadius: '10px', fontSize: '14px',
                fontWeight: '700', cursor: resolving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
              }}>
                {resolving ? 'Guardando...' : item.resuelto ? '↩ Desmarcar' : '✓ Marcar resuelto'}
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
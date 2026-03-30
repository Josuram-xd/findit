'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  nombre: string
  tipo: string
}

interface Organization {
  id: string
  nombre: string
  descripcion: string
  direccion: string
}

interface Item {
  id: string
  titulo: string
  descripcion: string
  estado: string
  categoria: string
  resuelto: boolean
  created_at: string
  imagen_url: string
  profiles: { nombre: string }
  organizations: { nombre: string }
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [myOrgs, setMyOrgs] = useState<Organization[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null)
  const [view, setView] = useState<'feed' | 'buscar_org'>('feed')
  const [searchOrg, setSearchOrg] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    if (!prof) { router.push('/'); return }
    setProfile(prof)

    if (prof.tipo === 'organizacion') {
      const { data: myOrg } = await supabase
        .from('organizations').select('*').eq('created_by', user.id)
      if (myOrg && myOrg.length > 0) {
        setMyOrgs(myOrg)
        setActiveOrg(myOrg[0])
        loadItems(myOrg[0].id)
      } else {
        router.push('/dashboard/org/setup')
        return
      }
    } else {
      const { data: memberships } = await supabase
        .from('memberships')
        .select('organization_id, organizations(*)')
        .eq('user_id', user.id)
      if (memberships && memberships.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userOrgs = memberships.map((m: any) => m.organizations)
        setMyOrgs(userOrgs)
        setActiveOrg(userOrgs[0])
        loadItems(userOrgs[0].id)
      } else {
        setView('buscar_org')
      }
    }
    setLoading(false)
  }

  const loadItems = async (orgId: string) => {
    const { data } = await supabase
      .from('items')
      .select('*, profiles(nombre), organizations(nombre)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  const searchOrgs = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .ilike('nombre', `%${searchOrg}%`)
    if (data) setOrgs(data)
  }

  const joinOrg = async (org: Organization) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('memberships').insert({ user_id: user.id, organization_id: org.id })
    setMyOrgs([...myOrgs, org])
    setActiveOrg(org)
    loadItems(org.id)
    setView('feed')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#475569' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid #1e293b', background: '#0a0f1e',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>
          Find<span style={{ color: '#6366f1' }}>It</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {profile && (
            <span style={{ color: '#64748b', fontSize: '13px' }}>
              {profile.nombre} · <span style={{ color: '#6366f1' }}>{profile.tipo}</span>
            </span>
          )}
          {profile?.tipo === 'persona' && (
            <button onClick={() => setView('buscar_org')} style={{
              background: 'transparent', border: '1px solid #334155',
              color: '#94a3b8', padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
            }}>
              + Unirse a org
            </button>
          )}
          <Link href="/dashboard/perfil" style={{
          background: 'transparent', border: '1px solid #334155',
          color: '#94a3b8', padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
          textDecoration: 'none',
          }}>
           Mi perfil
          </Link>
          
          <button onClick={logout} style={{
            background: 'transparent', border: '1px solid #334155',
            color: '#94a3b8', padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
          }}>
            Salir
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px', minWidth: '240px', borderRight: '1px solid #1e293b',
          padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <p style={{ color: '#334155', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
            MIS ORGANIZACIONES
          </p>
          {myOrgs.map(org => (
            <button key={org.id} onClick={() => { setActiveOrg(org); loadItems(org.id); setView('feed') }} style={{
              background: activeOrg?.id === org.id ? '#1e1b4b' : 'transparent',
              border: activeOrg?.id === org.id ? '1px solid #3730a3' : '1px solid transparent',
              color: activeOrg?.id === org.id ? '#818cf8' : '#64748b',
              padding: '10px 12px', borderRadius: '10px', textAlign: 'left',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}>
              {org.nombre}
            </button>
          ))}
          {myOrgs.length === 0 && (
            <p style={{ color: '#334155', fontSize: '12px', paddingLeft: '8px' }}>Sin organizaciones</p>
          )}

          {activeOrg && (
            <>
              <div style={{ borderTop: '1px solid #1e293b', marginTop: '16px', paddingTop: '16px' }} />
              <Link href="/dashboard/new-item" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#6366f1', borderRadius: '10px',
                  padding: '10px 12px', textAlign: 'center',
                  color: 'white', fontSize: '13px', fontWeight: '700',
                }}>
                  + Publicar objeto
                </div>
              </Link>
            </>
          )}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '32px', maxWidth: '800px' }}>
          {view === 'buscar_org' && (
            <div>
              <h2 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                Unirse a una organizacion
              </h2>
              <p style={{ color: '#475569', fontSize: '14px', marginBottom: '24px' }}>
                Busca la organizacion a la que perteneces
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Nombre de la organizacion..."
                  value={searchOrg}
                  onChange={e => setSearchOrg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchOrgs()}
                  style={{
                    flex: 1, padding: '12px 16px', background: '#0f172a',
                    border: '1px solid #1e293b', borderRadius: '10px',
                    color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                />
                <button onClick={searchOrgs} style={{
                  background: '#6366f1', color: 'white', padding: '12px 24px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: 'none',
                }}>
                  Buscar
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orgs.map(org => (
                  <div key={org.id} style={{
                    background: '#0f172a', border: '1px solid #1e293b',
                    borderRadius: '12px', padding: '20px 24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>{org.nombre}</p>
                      <p style={{ color: '#475569', fontSize: '13px' }}>{org.descripcion || 'Sin descripcion'}</p>
                      {org.direccion && <p style={{ color: '#334155', fontSize: '12px', marginTop: '4px' }}>{org.direccion}</p>}
                    </div>
                    <button onClick={() => joinOrg(org)} style={{
                      background: '#6366f1', color: 'white', padding: '8px 20px',
                      borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none',
                    }}>
                      Unirse
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'feed' && activeOrg && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>{activeOrg.nombre}</h2>
                  <p style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>{items.length} publicaciones</p>
                </div>
              </div>

              {items.length === 0 ? (
                <div style={{
                  background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px',
                  padding: '60px', textAlign: 'center',
                }}>
                  <p style={{ color: '#334155', fontSize: '16px', marginBottom: '8px' }}>Sin publicaciones aun</p>
                  <p style={{ color: '#1e293b', fontSize: '13px' }}>Se el primero en publicar un objeto perdido</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map(item => (
                    <Link key={item.id} href={`/dashboard/items/${item.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: '#0f172a', border: '1px solid #1e293b',
                        borderRadius: '16px', padding: '24px',
                        opacity: item.resuelto ? 0.5 : 1,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{
                              background: item.estado === 'perdido' ? '#450a0a' : '#052e16',
                              color: item.estado === 'perdido' ? '#fca5a5' : '#4ade80',
                              border: `1px solid ${item.estado === 'perdido' ? '#7f1d1d' : '#166534'}`,
                              padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700',
                            }}>
                              {item.estado === 'perdido' ? 'PERDIDO' : 'ENCONTRADO'}
                            </span>
                            <span style={{
                              background: '#1e293b', color: '#64748b',
                              padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
                            }}>
                              {item.categoria}
                            </span>
                            {item.resuelto && (
                              <span style={{
                                background: '#1e1b4b', color: '#818cf8',
                                border: '1px solid #3730a3',
                                padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700',
                              }}>
                                RESUELTO
                              </span>
                            )}
                          </div>
                          <span style={{ color: '#334155', fontSize: '12px' }}>
                            {new Date(item.created_at).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                        <h3 style={{ color: '#f1f5f9', fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
                          {item.titulo}
                        </h3>
                        <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                          {item.descripcion}
                        </p>
                        {item.imagen_url && (
                          <img src={item.imagen_url} alt={item.titulo} style={{
                            width: '100%', maxHeight: '300px', objectFit: 'cover',
                            borderRadius: '10px', marginBottom: '12px',
                          }} />
                        )}
                        <p style={{ color: '#334155', fontSize: '12px' }}>
                          Publicado por {item.profiles?.nombre || 'Usuario'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'feed' && !activeOrg && (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <p style={{ color: '#334155', fontSize: '16px' }}>No perteneces a ninguna organizacion aun</p>
              <button onClick={() => setView('buscar_org')} style={{
                marginTop: '16px', background: '#6366f1', color: 'white',
                padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: 'none',
              }}>
                Buscar organizacion
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
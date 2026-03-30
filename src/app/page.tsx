'use client'
import Link from 'next/link'

export default function Home() {
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
        <span style={{
          fontSize: '22px',
          fontWeight: '800',
          color: '#f1f5f9',
          letterSpacing: '-0.5px'
        }}>
          Find<span style={{ color: '#6366f1' }}>It</span>
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/auth/login?tipo=persona" style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid #334155',
            color: '#94a3b8',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
          }}>
            Iniciar sesion
          </Link>
          <Link href="/auth/login?tipo=persona" style={{
            padding: '8px 20px',
            borderRadius: '8px',
            background: '#6366f1',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}>
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          background: '#1e1b4b',
          border: '1px solid #3730a3',
          borderRadius: '100px',
          padding: '6px 16px',
          marginBottom: '32px',
        }}>
          <span style={{ color: '#818cf8', fontSize: '13px', fontWeight: '500' }}>
            Plataforma de objetos perdidos y encontrados
          </span>
        </div>

        <h1 style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#f1f5f9',
          lineHeight: '1.1',
          maxWidth: '700px',
          marginBottom: '24px',
          letterSpacing: '-2px',
        }}>
          Recupera lo que{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            importa
          </span>
        </h1>

        <p style={{
          color: '#64748b',
          fontSize: '18px',
          maxWidth: '500px',
          lineHeight: '1.7',
          marginBottom: '48px',
        }}>
          Conecta tu organizacion con un foro privado donde reportar
          y encontrar objetos perdidos de forma rapida y segura.
        </p>

        {/* CTA cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          width: '100%',
          maxWidth: '520px',
        }}>
          <Link href="/auth/login?tipo=persona" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '28px 24px',
              textAlign: 'left',
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#1e1b4b',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                Soy Persona
              </h3>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5' }}>
                Unete a tu organizacion y gestiona tus objetos
              </p>
              <div style={{
                marginTop: '16px',
                color: '#6366f1',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Entrar →
              </div>
            </div>
          </Link>

          <Link href="/auth/login?tipo=organizacion" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '28px 24px',
              textAlign: 'left',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#1e1b4b',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                Soy Organizacion
              </h3>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5' }}>
                Registra tu espacio y administra tu comunidad
              </p>
              <div style={{
                marginTop: '16px',
                color: '#6366f1',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Registrar →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid #1e293b',
        color: '#334155',
        fontSize: '13px',
      }}>
        FindIt — Tu informacion esta protegida con cifrado de extremo a extremo
      </footer>
    </main>
  )
}
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'StudyMaterial';
    const tag = searchParams.get('tag') || 'Developers';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(18, 18, 24) 0%, rgb(8, 8, 12) 100%)',
            padding: '80px',
            position: 'relative',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          {/* Subtle glow circles */}
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              right: '-150px',
              width: '500px',
              height: '500px',
              borderRadius: '250px',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-150px',
              left: '-150px',
              width: '500px',
              height: '500px',
              borderRadius: '250px',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%)',
            }}
          />

          {/* Grid Pattern Simulation */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Top Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#06b6d4',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontFamily: 'monospace'
              }}
            >
              StudyMaterial
            </span>
            <div style={{ width: '4px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
            >
              Developer Platform
            </span>
          </div>

          {/* Middle Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10 }}>
            {tag && (
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#a855f7',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                #{tag}
              </span>
            )}
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 800,
                color: '#fdfdfd',
                lineHeight: 1.25,
                margin: 0,
                letterSpacing: '-0.02em',
                maxWidth: '900px'
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Footer Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '30px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Interactive Workspace Studio</span>
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              studymaterial.dev
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate dynamic OG Image: ${e.message}`, {
      status: 500
    });
  }
}

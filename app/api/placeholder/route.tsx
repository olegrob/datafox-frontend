import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 40,
          color: 'black',
          background: '#f1f5f9',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>No image available</p>
      </div>
    ),
    {
      width: 600,
      height: 600,
    },
  )
}

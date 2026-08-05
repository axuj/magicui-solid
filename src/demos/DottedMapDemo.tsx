import type { TCountryCode } from 'countries-list'
import type { Marker } from '@/registry/magicui/dotted-map'
import { DottedMap } from '@/registry/magicui/dotted-map'

type CountryCode = Lowercase<TCountryCode>

type MyMarker = Marker & {
  overlay: {
    countryCode: CountryCode
    label: string
  }
}

const markers: MyMarker[] = [
  {
    lat: 37.5665,
    lng: 126.978,
    size: 2.8,
    overlay: { countryCode: 'kr', label: 'Seoul' },
  },
  {
    lat: 40.7128,
    lng: -74.006,
    size: 2.8,
    overlay: { countryCode: 'us', label: 'NYC' },
  },
]

export function DottedMapDemo() {
  return (
    <div class="relative h-125 w-full overflow-hidden rounded-lg border">
      <div class="
        absolute inset-0 bg-radial from-transparent to-background to-200%
      "
      />
      <DottedMap<MyMarker>
        markers={markers}
        renderMarkerOverlay={({ marker, x, y, r }) => {
          const { countryCode, label } = marker.overlay
          const href = `https://flagcdn.com/w80/${countryCode}.webp`

          const imgR = r * 0.75

          const fontSize = r * 0.9
          const pillH = r * 1.5
          const pillW = label.length * (fontSize * 0.62) + r * 1.4
          const pillX = x + r + r * 0.6
          const pillY = y - pillH / 2

          return (
            <g style={{ 'pointer-events': 'none' }}>
              <image
                href={href}
                x={x - imgR}
                y={y - imgR}
                width={imgR * 2}
                height={imgR * 2}
                preserveAspectRatio="xMidYMid slice"
                style={{ 'clip-path': 'circle(50% at 50% 50%)' }}
              />

              <rect
                x={pillX}
                y={pillY}
                width={pillW}
                height={pillH}
                rx={pillH / 2}
                fill="rgba(0,0,0,0.55)"
              />
              <text
                x={pillX + r * 0.7}
                y={y + fontSize * 0.35}
                style={{ 'font-size': `${fontSize}px` }}
                fill="white"
              >
                {label}
              </text>
            </g>
          )
        }}
      />
    </div>
  )
}

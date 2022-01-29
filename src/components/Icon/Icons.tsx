import React from 'react'

const copyClipboard = ({ color = '#A7B1F4' }) => (
  <>
    <path
      d="M17 1H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V3a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 15v2a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

const home = ({ color = 'white' }) => (
    <path fill={color} d="M550,550.71h-6.53a.6.6,0,0,1-.6-.6V546.2a2.46,2.46,0,1,0-4.92,0v3.91a.59.59,0,0,1-.59.6h-6.59a.6.6,0,0,1-.6-.6V539.65a.55.55,0,0,1,.16-.4L540,528.79a.62.62,0,0,1,.45-.2.62.62,0,0,1,.44.21l9.62,11a.59.59,0,0,1,.15.4v10A.6.6,0,0,1,550,550.71Zm-5.93-1.19h5.33v-9.15l-9-10.28-9,9.8v9.63h5.4V546.2a3.66,3.66,0,0,1,7.31,0Z" transform="translate(-530.19 -528.59)" />
)

const trade = ({ color = 'white' }) => (
  <>
    <path
      d="M2 3a2 2 0 104 0 2 2 0 00-4 0zM14 17a2 2 0 104 0 2 2 0 00-4 0zM14 17H9a5 5 0 01-5-5V9l-3 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 3h5a5 5 0 015 5v3m0 0l3-3m-3 3l-3-3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

const bridges = ({ color = 'white' }) => (
  <path
    d="M3 19a2 2 0 100-4 2 2 0 000 4zM17 5a2 2 0 100-4 2 2 0 000 4zM9 17h5.5a3.5 3.5 0 100-7h-8a3.5 3.5 0 110-7H11"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
)

const earn = ({ color = 'white' }) => (
  <>
    <path
      d="M4 1h12l3 6.438-8.5 11.334a.701.701 0 01-.229.169.651.651 0 01-.542 0 .7.7 0 01-.229-.17L1 7.438 4 1z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 10L6 7.25 7 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </>
)

const charts = ({ color = 'white' }) => (
  <path
    d="M1 19l4.5-7.2 4.5 2.4 4.5-6L19 13v5a1 1 0 01-1 1H1zM1 10.6l3.375-4.8 4.5 2.4L14.5 1 19 5.8"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
)

const market = ({ color = 'white' }) => (
  <>
    <path fill={color} d="M636.88,656.6H620.74a3,3,0,0,1-3-3V641.36a3,3,0,0,1,3-3h16.14a3,3,0,0,1,3,3v12.25A3,3,0,0,1,636.88,656.6Zm-16.14-17a1.81,1.81,0,0,0-1.8,1.8v12.25a1.8,1.8,0,0,0,1.8,1.79h16.14a1.79,1.79,0,0,0,1.79-1.79V641.36a1.8,1.8,0,0,0-1.79-1.8Z" transform="translate(-617.75 -634.48)"/>
    <path fill={color} d="M632.69,639.56h-7.77a.6.6,0,0,1-.6-.6,4.49,4.49,0,0,1,9,0A.6.6,0,0,1,632.69,639.56Zm-7.12-1.19H632a3.29,3.29,0,0,0-6.47,0Z" transform="translate(-617.75 -634.48)"/>
    <path fill={color} d="M624.92,642a.9.9,0,1,0,.9.9A.9.9,0,0,0,624.92,642Z" transform="translate(-617.75 -634.48)"/>
    <path fill={color} d="M632.69,642a.9.9,0,1,0,0,1.8.9.9,0,1,0,0-1.8Z" transform="translate(-617.75 -634.48)"/>
  </>
)

const planet = ({ color = 'white' }) => (
  <>
    <rect fill={color} x="758.10174" y="584.32951" width="6.33693" height="0.9737" transform="translate(-946.523 143.28658) rotate(-45)"/>
    <rect fill={color} x="757.91736" y="581.16473" width="4.27124" height="0.9737" transform="translate(-944.64168 141.49893) rotate(-45)"/>
    <rect fill={color} x="762.29936" y="585.54673" width="4.27124" height="0.9737" transform="translate(-946.45677 145.88093) rotate(-45)"/>
    <path fill={color} d="M779.28508,566.80148h-.48694a18.54368,18.54368,0,0,0-12.2926,4.382h-3.97632l-5.35583,5.35578h5.64392a11.37624,11.37624,0,0,0-.56946,2.37359l-.02979.23676,4.71936,4.71918.23682-.03a11.3942,11.3942,0,0,0,2.373-.57221v5.64649l5.35583-5.35578v-3.98284a18.53745,18.53745,0,0,0,4.382-12.28608Zm-6.573,9.25085a2.67789,2.67789,0,1,1,2.67786-2.67786A2.68106,2.68106,0,0,1,772.71208,576.05233Z" transform="translate(-755.96627 -566.30148)"/>
  </>
)

const ido = ({ color = 'white' }) => (
  <>    
    <path fill={color} d="M540.4046,528.30347a11.34973,11.34973,0,1,1-11.34973,11.34973,11.34975,11.34975,0,0,1,11.34973-11.34973m0-1a12.34973,12.34973,0,1,0,12.34979,12.34973,12.36376,12.36376,0,0,0-12.34979-12.34973Z" transform="translate(-528.05487 -527.30347)"/>
    <path fill={color} d="M540.4046,535.31537l1.40949,2.85583,3.15161.45795-2.28052,2.223.53833,3.13892-2.81891-1.482-2.81891,1.482.53839-3.13892-2.28051-2.223,3.15161-.45795,1.40942-2.85583m0-2.25952-.89673,1.817-1.17675,2.3844-2.63135.38233-2.00519.29138,1.451,1.4143,1.904,1.856-.44952,2.62073-.34253,1.99707,1.79346-.94287,2.35357-1.23737,2.35358,1.23737,1.79346.94287-.34253-1.997-.44947-2.62079,1.90406-1.856,1.451-1.4143-2.00519-.29138-2.63135-.38233-1.17682-2.3844-.89673-1.817Z" transform="translate(-528.05487 -527.30347)"/>
  </>
)

const wallet = ({ color = 'white' }) => (
  <>
    <path
      d="M15 3.6V3a1 1 0 00-1-1H4a2 2 0 00-2 2m0 0a2 2 0 002 2h12a1 1 0 011 1v3M2 4v12a2 2 0 002 2h12a1 1 0 001-1v-3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18 10v4h-4a2 2 0 010-4h4z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </>
)

const alien = ({ color = 'white' }) => (
  <path
    d="M9.09 14.444a2.317 2.317 0 001.817 0M9.998 2C5.76 2 3.276 4.072 2.852 6.973A10.322 10.322 0 004.67 14.61a9.705 9.705 0 002.908 2.723 4.734 4.734 0 004.844 0 9.704 9.704 0 002.908-2.723 10.387 10.387 0 001.817-7.637C16.724 4.071 14.241 2 10.002 2h-.004zM6.363 9.11l1.817 1.778M13.634 9.11l-1.818 1.778"
    strokeWidth={2}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
)

const settings = ({ color = 'white' }) => (
  <>
    <path
      d="M11.8 2.142c0-.63-.511-1.142-1.142-1.142H9.343C8.711 1 8.2 1.511 8.2 2.142c0 .52-.356.967-.841 1.158-.077.03-.154.063-.228.095-.478.207-1.046.144-1.415-.224a1.142 1.142 0 00-1.615 0l-.93.93a1.142 1.142 0 000 1.615v0c.369.369.432.936.223 1.415a7.14 7.14 0 00-.095.228c-.19.485-.637.841-1.157.841C1.512 8.2 1 8.711 1 9.342v1.316c0 .63.511 1.142 1.142 1.142.52 0 .967.356 1.158.841.03.077.063.153.094.228.208.478.145 1.046-.223 1.415a1.142 1.142 0 000 1.615l.93.93a1.142 1.142 0 001.615 0c.369-.369.936-.432 1.415-.224.074.033.151.065.228.096.485.19.841.637.841 1.157 0 .63.511 1.142 1.142 1.142h1.316c.63 0 1.142-.511 1.142-1.142 0-.52.356-.967.841-1.158a6.35 6.35 0 00.228-.094c.478-.209 1.046-.145 1.414.223a1.142 1.142 0 001.616 0l.93-.93a1.142 1.142 0 000-1.615v0c-.369-.369-.432-.936-.224-1.415.033-.075.065-.151.096-.227.19-.486.637-.842 1.157-.842.63 0 1.142-.511 1.142-1.142V9.343c0-.63-.511-1.142-1.142-1.142-.52 0-.967-.357-1.158-.842a7.167 7.167 0 00-.095-.227c-.207-.478-.144-1.046.224-1.415a1.142 1.142 0 000-1.615l-.93-.93a1.142 1.142 0 00-1.615 0v0c-.369.369-.936.432-1.415.224a7.127 7.127 0 00-.227-.096c-.486-.191-.842-.638-.842-1.157v0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.7 10a2.7 2.7 0 11-5.4 0 2.7 2.7 0 015.4 0v0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

const arrowDown = ({ color = 'white' }) => (
  <>
    <path d="M16.292 6.293a1.001 1.001 0 011.415 1.414l-7 7a1.001 1.001 0 01-1.415-1.414l7-7z" fill={color} />
    <path d="M2.293 7.707a1 1 0 111.415-1.414l7 7a1 1 0 11-1.416 1.414l-6.999-7z" fill={color} />
  </>
)

const swap = ({ color = 'white' }) => (
  <>
    <path
      d="M2 3a2 2 0 104 0 2 2 0 00-4 0zM14 17a2 2 0 104 0 2 2 0 00-4 0zM14 17H9a5 5 0 01-5-5V9l-3 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 3h5a5 5 0 015 5v3m0 0l3-3m-3 3l-3-3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

const more = ({ color = 'white' }) => (
  <>
    <path fill={color} d="M775.0685,531.39946h-20.872a.59778.59778,0,1,1,0-1.19555h20.872a.59778.59778,0,1,1,0,1.19555Z" transform="translate(-753.57356 -530.20391)"/>
    <path fill={color} d="M769.14091,538.35683H754.19646a.59778.59778,0,1,1,0-1.19556h14.94445a.59778.59778,0,1,1,0,1.19556Z" transform="translate(-753.57356 -530.20391)"/>
    <path fill={color} d="M775.0936,545.31417H754.17135a.59778.59778,0,1,1,0-1.19556H775.0936a.59778.59778,0,1,1,0,1.19556Z" transform="translate(-753.57356 -530.20391)"/>
    <path fill={color} d="M769.14091,552.27153H754.19646a.59778.59778,0,1,1,0-1.19555h14.94445a.59778.59778,0,1,1,0,1.19555Z" transform="translate(-753.57356 -530.20391)"/>
  </>
)

const Icons = {
  home,
  trade,
  bridges,
  swap,
  earn,
  charts,
  market,
  planet,
  wallet,
  alien,
  settings,
  copyClipboard,
  arrowDown,
  more,
  ido
}

export default Icons

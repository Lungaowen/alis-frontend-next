import type { SVGProps } from "react";

type IconName = "grid"|"scan"|"folder"|"document"|"shield"|"briefcase"|"settings"|"search"|"bell"|"plus"|"arrow"|"spark"|"clock"|"users"|"chat"|"upload"|"check"|"calendar"|"lock"|"dots"|"gavel";

const paths: Record<IconName, string[]> = {
  grid:["M4 4h6v6H4z","M14 4h6v6h-6z","M4 14h6v6H4z","M14 14h6v6h-6z"],
  scan:["M5 8V5h3","M19 8V5h-3","M5 16v3h3","M19 16v3h-3","M8 12h8"],
  folder:["M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  document:["M7 3h7l4 4v14H7z","M14 3v5h5","M10 13h6","M10 17h6"],
  shield:["M12 3 19 6v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z","M9 12l2 2 4-5"],
  briefcase:["M9 6V4h6v2","M4 8h16v11H4z","M4 12h16","M10 12v2h4v-2"],
  settings:["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z","M4.9 4.9l1.4 1.4","M17.7 17.7l1.4 1.4","M4 12H2","M22 12h-2","M12 4V2","M12 22v-2"],
  search:["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z","M20 20l-4-4"],
  bell:["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9","M10 21h4"],
  plus:["M12 5v14","M5 12h14"],
  arrow:["M5 12h14","M13 6l6 6-6 6"],
  spark:["M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"],
  clock:["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z","M12 7v5l3 2"],
  users:["M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1","M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8","M20 20v-1a4 4 0 0 0-3-3.9"],
  chat:["M4 5h16v10H8l-4 4z","M8 9h8","M8 12h5"],
  upload:["M12 16V4","M8 8l4-4 4 4","M5 20h14"],
  check:["M5 12l4 4L19 6"],
  calendar:["M6 3v4","M18 3v4","M4 8h16","M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1z"],
  lock:["M7 10V8a5 5 0 0 1 10 0v2","M5 10h14v10H5z"],
  dots:["M5 12h.01","M12 12h.01","M19 12h.01"],
  gavel:["M14 6l4 4","M10 10l8 8","M5 19l14-14","M3 21h8"]
};

export function Icon({name,size=18,strokeWidth=1.8,className="",...props}: SVGProps<SVGSVGElement> & {name:IconName;size?:number}) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>{paths[name].map((d,i)=><path key={i} d={d}/>)}</svg>;
}

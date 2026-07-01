/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

function App() {
  let [displayText, setDisplayText] = useState("");

  let updateText:
    | React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>
    | undefined = (event) => {
    if (event !== undefined) {
      const { value } = event.target;
      setDisplayText(() => value);
    } else {
      setDisplayText("");
    }
  };

  let [sidebarExtended, setSidebarExtended] = useState(false);
  const navigationItems = [
    {
      name: "Dashboard",
      href: "#",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
    },
    {
      name: "Analytics",
      href: "#",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
          />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "#",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.3.23-.465.594-.451.974.002.052.002.104.002.156 0 .052 0 .104-.001.156-.014.38.15.744.45 1.01l1.002.722c.426.308.52.894.26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124-.072.044-.146.087-.22.128-.332.183-.582.495-.644.869l-.214 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.304-.23.468-.594.453-.974a5.99 5.99 0 0 1-.002-.312c.015-.38-.15-.744-.454-1.01l-1.002-.722a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-1">
      {/* <div className="flex flex-1 flex-col max-h-screen">
        <div className={`flex h-15 m-2 border-2 mr-3 rounded-xl overflow-hidden transition-all ${
          sidebarExtended ? 'w-50' : 'w-30'
          }`}>
          <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = '/'
            }
          }
          className="flex relative flex-1 bg-amber-200 p-1"
          >
            Logo
            <button className="absolute top-2 right-2 w-10 h-7 rounded-md border-2 bg-blue-200"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarExtended((prev) => !prev);
            }}
            >
              {
                (sidebarExtended) ? 
                  (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )
              }
            </button>
          </button>
        </div>
        <div className={`${sidebarExtended ? 'w-80' : 'w-20'} flex h-screen bg-blue-300 rounded-r-3xl transition-all duration-200`}>
        </div>  
      </div> */}

      <div className="flex flex-1 flex-col max-h-screen">
        {/* Main Sidebar Wrapper */}
        <div
          className={`group/sidebar flex flex-col h-screen bg-blue-300 rounded-r-3xl transition-all duration-300 ${
            sidebarExtended ? "w-80" : "w-20"
          }`}
        >
          {/* Top Header Container */}
          <div className="flex h-15 m-2 mr-3 border-2 rounded-xl bg-amber-200 overflow-hidden items-center justify-between p-2 min-h-[44px]">
            {/* 1. Left Logo Link */}
            <button
              onClick={() => (window.location.href = "/")}
              className={`flex items-center font-bold text-gray-800 transition-all duration-200 text-left ${
                sidebarExtended
                  ? "w-24 opacity-100 p-1"
                  : "w-0 opacity-0 pointer-events-none overflow-hidden"
              }`}
            >
              Logo
            </button>

            {/* 2. Centered/Right Action Trigger */}
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ${
                sidebarExtended ? "w-auto" : "flex-1 h-full"
              }`}
            >
              {!sidebarExtended && (
                <span className="absolute font-black text-gray-800 text-lg transition-opacity duration-100 group-hover/sidebar:opacity-0">
                  L
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarExtended((prev) => !prev);
                }}
                className={`rounded-md border-2 bg-blue-200 text-gray-700 flex items-center justify-center transition-all duration-200 w-10 h-7 ${
                  sidebarExtended
                    ? "opacity-100 hover:bg-blue-300"
                    : "opacity-0 group-hover/sidebar:opacity-100 hover:bg-blue-300 z-10"
                }`}
                aria-label={
                  sidebarExtended ? "Collapse Sidebar" : "Expand Sidebar"
                }
              >
                {sidebarExtended ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* --- NEW: Vertical Menu Navigation List --- */}
          <nav className="flex-1 p-2 space-y-2 mt-4">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                /* 
                'group/link' isolates this specific row's hover state 
                from the main outer '/sidebar' group wrapper.
              */
                className={`group/link relative flex items-center gap-3 p-3 rounded-xl font-medium text-gray-700 hover:bg-blue-400/40 hover:text-gray-900 transition-all duration-200 ${
                  sidebarExtended ? "justify-start" : "justify-center"
                }`}
              >
                {/* Icon Asset Wrapper */}
                <span className="text-gray-600 group-hover/link:text-gray-900 transition-colors">
                  {item.icon}
                </span>

                {/* Text Label: Fades and hides seamlessly via layout configuration widths */}
                <span
                  className={`whitespace-nowrap transition-all duration-200 overflow-hidden ${
                    sidebarExtended
                      ? "w-auto opacity-100"
                      : "w-0 opacity-0 pointer-events-none"
                  }`}
                >
                  {item.name}
                </span>

                {/* --- NEW: Floating Tooltip Card (Only triggers when collapsed) --- */}
                {!sidebarExtended && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-gray-900 text-xs font-semibold text-white shadow-xl pointer-events-none whitespace-nowrap transition-all duration-150 scale-95 opacity-0 invisible group-hover/link:opacity-100 group-hover/link:visible group-hover/link:scale-100 z-50">
                    {item.name}

                    {/* Small Tooltip Pointer Triangle Arrow */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                )}
              </a>
            ))}
          </nav>

          {/* --- NEW: Bottom User Profile Footer Section --- */}
          <div className="p-3 border-t border-blue-400/30 mb-2">
            <div
              className={`group/profile relative flex items-center rounded-xl transition-all duration-200 ${
                sidebarExtended
                  ? "justify-between p-2 hover:bg-blue-400/20"
                  : "justify-center p-2"
              }`}
            >
              {/* Extended State: Clickable profile wrapper redirects to profile page */}
              <button
                onClick={() => (window.location.href = "/profile")}
                disabled={!sidebarExtended}
                className={`flex items-center gap-3 text-left focus:outline-none min-w-0 ${
                  sidebarExtended ? "cursor-pointer flex-1" : "cursor-default"
                }`}
              >
                <img
                  src="https://unsplash.com"
                  alt="User avatar"
                  className="h-10 w-10 rounded-full border border-blue-400/40 object-cover flex-shrink-0"
                />

                <div
                  className={`flex flex-col min-w-0 transition-all duration-200 ${
                    sidebarExtended
                      ? "w-auto opacity-100"
                      : "w-0 h-0 opacity-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    Tom Cook
                  </span>
                  <span className="text-xs text-gray-600 truncate">
                    tom@example.com
                  </span>
                </div>
              </button>

              {/* Extended State: Inline Logout Button */}
              {sidebarExtended && (
                <button
                  onClick={() => console.log("Logging out...")}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors ml-1 flex-shrink-0"
                  aria-label="Logout"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                </button>
              )}

              {/* Collapsed State: Hover Floating Popup Menu Panel */}
              {/* Collapsed State: Hover Floating Popup Menu Panel with Slide-in Effect */}
              {!sidebarExtended && (
                <div
                  className="absolute left-full bottom-0 ml-2 w-48 rounded-xl bg-white border border-gray-100 p-1.5 shadow-2xl z-50
    /* 1. Reset / Base Transition Values */
    transition-all duration-300 ease-out
    /* 2. Hidden Rest State (Slightly lower and offset to the left) */
    opacity-0 invisible -translate-x-2 translate-y-1 scale-95
    /* 3. Hover Target State (Snaps back smoothly to 0 offset positions) */
    group-hover/profile:opacity-100 group-hover/profile:visible group-hover/profile:translate-x-0 group-hover/profile:translate-y-0 group-hover/profile:scale-100"
                >
                  {/* Header Identity Label */}
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Account
                    </p>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      Tom Cook
                    </p>
                  </div>

                  {/* Action Links */}
                  <button
                    onClick={() => (window.location.href = "/profile")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    Profile Page
                  </button>

                  <button
                    onClick={() => console.log("Logging out...")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// <div className="flex flex-1 flex-col max-h-screen">
//   {/* Main Sidebar Wrapper */}
//   <div className={`group flex flex-col h-screen bg-blue-300 rounded-r-3xl transition-all duration-300 ${
//     sidebarExtended ? 'w-80' : 'w-20'
//   }`}>

//     {/* Top Header Container */}
//     <div className="flex h-15 m-2 mr-3 border-2 rounded-xl bg-amber-200 overflow-hidden items-center justify-between p-2 min-h-[44px]">

//       {/* 1. Left Logo Link */}
//       <button
//         onClick={() => window.location.href = '/'}
//         className={`flex items-center font-bold text-gray-800 transition-all duration-200 text-left ${
//           sidebarExtended
//             ? 'w-24 opacity-100 p-1'
//             : 'w-0 opacity-0 pointer-events-none overflow-hidden'
//         }`}
//       >
//         Logo
//       </button>

//       {/* 2. Centered/Right Action Trigger */}
//       <div className={`relative flex items-center justify-center transition-all duration-300 ${
//         sidebarExtended ? 'w-auto' : 'flex-1 h-full'
//       }`}>

//         {/* --- NEW: Compact Mini-Logo --- */}
//         {/* This shows a neat single letter 'L' when collapsed, but vanishes the exact moment you hover over the box */}
//         {!sidebarExtended && (
//           <span className="absolute font-black text-gray-800 text-lg transition-opacity duration-100 group-hover:opacity-0">
//             L
//           </span>
//         )}

//         {/* 3. The Toggle Button */}
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setSidebarExtended((prev) => !prev);
//           }}
//           className={`rounded-md border-2 bg-blue-200 text-gray-700 flex items-center justify-center transition-all duration-200 w-10 h-7 ${
//             sidebarExtended
//               ? 'opacity-100 hover:bg-blue-300'
//               : 'opacity-0 group-hover:opacity-100 hover:bg-blue-300 z-10'
//           }`}
//           aria-label={sidebarExtended ? "Collapse Sidebar" : "Expand Sidebar"}
//         >
//           {sidebarExtended ? (
//             /* Left Arrow (<) */
//             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
//             </svg>
//           ) : (
//             /* Right Arrow (>) */
//             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
//             </svg>
//           )}
//         </button>
//       </div>

//     </div>

//       {/* Sidebar contents placeholder */}
//       <div className="flex-1 p-2">

//       </div>
//   </div>
// </div>

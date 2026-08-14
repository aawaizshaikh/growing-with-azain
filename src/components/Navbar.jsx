import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import logoStar from "../assets/illustrations/star.png";

import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineHeart,
} from "react-icons/hi";

import {
  HiOutlineMusicalNote,
  HiOutlineEnvelope,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowLeft,
} from "react-icons/hi2";

import { FaRegStar } from "react-icons/fa6";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const isHomePage = location.pathname === "/";

  const menu = [
    {
      name: "Home",
      path: "/",
      icon: <HiOutlineHome size={20} />,
    },
    {
      name: "Timeline",
      path: "/timeline",
      icon: <HiOutlineCalendar size={20} />,
    },
    {
      name: "Milestones",
      path: "/milestones",
      icon: <FaRegStar size={17} />,
    },
    {
      name: "Favourite Songs",
      path: "/favorite-songs",
      icon: <HiOutlineMusicalNote size={20} />,
    },
    {
      name: "Gallery",
      path: "/gallery",
      icon: <HiOutlinePhotograph size={20} />,
    },
    {
      name: "Letters",
      path: "/letters",
      icon: <HiOutlineEnvelope size={20} />,
    },
    {
      name: "About Azain",
      path: "/about",
      icon: <HiOutlineHeart size={20} />,
    },
  ];

  /* ============================================================
     CLOSE MENU WHEN ROUTE CHANGES
     ============================================================ */

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ============================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
     ============================================================ */

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuOpen) return;

      const clickedInsideMenu =
        menuRef.current?.contains(event.target);

      const clickedMenuButton =
        buttonRef.current?.contains(event.target);

      if (!clickedInsideMenu && !clickedMenuButton) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, [menuOpen]);

  /* ============================================================
     ESCAPE KEY
     ============================================================ */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* ============================================================
     BACK BUTTON
     ============================================================ */

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  /* ============================================================
     HOME PAGE
     
     HOME GETS THE ORIGINAL HORIZONTAL NAVBAR.
     MOBILE HOME STILL USES THE HAMBURGER MENU.
     ============================================================ */

  if (isHomePage) {
    return (
      <header
        className="
          sticky
          top-0
          z-50
          bg-[#FAF8F2]/95
          backdrop-blur-md
          shadow-sm
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-5
            sm:px-8
            lg:px-12
            py-5
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            {/* ==================================================
                LOGO
                ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: -25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="
                flex
                items-center
                gap-3
                sm:gap-5
                -ml-4
              "
            >
              <img
                src={logoStar}
                alt=""
                className="
                  w-10
                  h-10
                  sm:w-14
                  sm:h-14
                  translate-x-50
                  translate-y-6
                "
              />

              <div className="-translate-x-20">
                <h1
                  className="
                    leading-none
                    text-3xl
                    sm:text-5xl
                    lg:text-[62px]
                    font-bold
                  "
                  style={{
                    fontFamily: "Baloo 2",
                    color: "#88A56C",
                  }}
                >
                  Growing
                </h1>

                <div
                  className="
                    flex
                    items-end
                    gap-2
                    -mt-1
                  "
                >
                  <span
                    className="
                      text-sm
                      sm:text-lg
                      lg:text-[22px]
                    "
                    style={{
                      fontFamily: "Nunito",
                      color: "#88A56C",
                    }}
                  >
                    with
                  </span>

                  <span
                    className="
                      text-2xl
                      sm:text-4xl
                      lg:text-[48px]
                      font-bold
                    "
                    style={{
                      fontFamily: "Baloo 2",
                      color: "#F3B54D",
                    }}
                  >
                    Azain
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ==================================================
                DESKTOP HORIZONTAL MENU
                ================================================== */}

            <nav
              className="
                hidden
                lg:flex
                items-center
                gap-8
                xl:gap-10
              "
            >
              {menu.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `
                      relative
                      flex
                      items-center
                      gap-2
                      text-[19px]
                      xl:text-[21px]
                      font-semibold
                      transition-all
                      whitespace-nowrap
                      ${
                        isActive
                          ? "text-[#88A56C]"
                          : "text-[#303030] hover:text-[#88A56C]"
                      }
                    `
                  }
                  style={{
                    fontFamily: "Nunito",
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {item.icon}

                      {item.name}

                      {isActive && (
                        <span
                          className="
                            absolute
                            left-0
                            -bottom-4
                            h-[3px]
                            w-full
                            rounded-full
                            bg-[#88A56C]
                          "
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* ==================================================
                MOBILE BUTTON
                ================================================== */}

            <motion.button
              whileTap={{
                scale: 0.9,
              }}
              whileHover={{
                scale: 1.05,
              }}
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              className="
                lg:hidden
                w-12
                h-12
                rounded-full
                bg-[#E8F0D8]
                flex
                items-center
                justify-center
                shadow-lg
              "
              aria-label="Open navigation menu"
            >
              {menuOpen ? (
                <HiOutlineXMark
                  size={28}
                  color="#5E6F4D"
                />
              ) : (
                <HiOutlineBars3
                  size={28}
                  color="#5E6F4D"
                />
              )}
            </motion.button>
          </div>

          {/* ====================================================
              MOBILE MENU
              ==================================================== */}

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="
                  lg:hidden
                  mt-5
                  bg-white
                  rounded-3xl
                  shadow-2xl
                  border
                  border-[#ECE8DF]
                  overflow-hidden
                "
              >
                <div className="py-3">
                  {menu.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className={({ isActive }) =>
                        `
                          flex
                          items-center
                          gap-4
                          px-6
                          py-5
                          transition-all
                          ${
                            isActive
                              ? "bg-[#EEF6E7] text-[#88A56C]"
                              : "text-[#333] hover:bg-[#F8F8F8]"
                          }
                        `
                      }
                      style={{
                        fontFamily: "Nunito",
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={
                              isActive
                                ? "text-[#88A56C]"
                                : "text-[#6A6A6A]"
                            }
                          >
                            {item.icon}
                          </div>

                          <span
                            className="
                              text-lg
                              font-semibold
                            "
                          >
                            {item.name}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    );
  }

  /* ============================================================
     ALL NON-HOME PAGES
     
     KEEP THE CURRENT HAMBURGER-STYLE NAVBAR.
     THIS INCLUDES ABOUT AZAIN.
     ============================================================ */

  return (
    <>
      {/* ============================================================
          BACK BUTTON — TOP LEFT
          ============================================================ */}

      <div
        className="
          fixed
          top-4
          left-4
          sm:top-5
          sm:left-5
          z-[100]
        "
      >
        <motion.button
          type="button"
          onClick={handleBack}
          whileHover={{
            scale: 1.06,
            y: -1,
          }}
          whileTap={{
            scale: 0.92,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 22,
          }}
          aria-label="Go back"
          title="Go back"
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            sm:w-12
            sm:h-12
            rounded-full
            bg-[#FAF8F2]
            text-[#66765A]
            border
            border-[#E6E0D4]
            shadow-lg
            hover:bg-white
            transition-colors
          "
        >
          <HiOutlineArrowLeft size={22} />
        </motion.button>
      </div>

      {/* ============================================================
          MENU BUTTON — TOP RIGHT
          ============================================================ */}

      <div
        ref={buttonRef}
        className="
          fixed
          top-4
          right-4
          sm:top-5
          sm:right-5
          z-[100]
        "
      >
        <motion.button
          type="button"
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          whileHover={{
            scale: 1.06,
            y: -1,
          }}
          whileTap={{
            scale: 0.92,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 22,
          }}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          title={
            menuOpen
              ? "Close menu"
              : "Open menu"
          }
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            sm:w-12
            sm:h-12
            rounded-full
            bg-[#FAF8F2]
            text-[#66765A]
            border
            border-[#E6E0D4]
            shadow-lg
            hover:bg-white
            transition-colors
          "
        >
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            {menuOpen ? (
              <motion.span
                key="close"
                initial={{
                  opacity: 0,
                  rotate: -45,
                  scale: 0.7,
                }}
                animate={{
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  rotate: 45,
                  scale: 0.7,
                }}
                transition={{
                  duration: 0.16,
                }}
              >
                <HiOutlineXMark size={24} />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{
                  opacity: 0,
                  rotate: 45,
                  scale: 0.7,
                }}
                animate={{
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  rotate: -45,
                  scale: 0.7,
                }}
                transition={{
                  duration: 0.16,
                }}
              >
                <HiOutlineBars3 size={24} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* ============================================================
            NAVIGATION PANEL
            ============================================================ */}

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.96,
              }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 28,
                mass: 0.7,
              }}
              className="
                absolute
                right-0
                top-14
                w-64
                sm:w-72
                overflow-hidden
                rounded-3xl
                bg-[#FAF8F2]
                border
                border-[#E5DED1]
                shadow-2xl
              "
            >
              {/* ======================================================
                  MENU HEADER
                  ====================================================== */}

              <div
                className="
                  px-5
                  pt-5
                  pb-4
                  border-b
                  border-[#EAE4D9]
                "
              >
                <p
                  className="
                    text-[10px]
                    tracking-widest
                    uppercase
                    font-semibold
                    text-[#8A947F]
                  "
                  style={{
                    fontFamily: "Nunito",
                  }}
                >
                  Azain's World
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-[#4E5D46]
                  "
                  style={{
                    fontFamily: "Baloo 2",
                  }}
                >
                  Where would you like to go?
                </p>
              </div>

              {/* ======================================================
                  MENU ITEMS
                  ====================================================== */}

              <div className="p-2">
                {menu.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{
                      opacity: 0,
                      x: 8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.035,
                      duration: 0.2,
                    }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className={({ isActive }) =>
                        `
                          group
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-2xl
                          transition-all
                          duration-200
                          ${
                            isActive
                              ? "bg-[#EAF1DE] text-[#637654]"
                              : "text-[#4F514C] hover:bg-[#F2EFE7] hover:text-[#637654]"
                          }
                        `
                      }
                      style={{
                        fontFamily: "Nunito",
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`
                              flex
                              items-center
                              justify-center
                              w-9
                              h-9
                              rounded-full
                              transition-all
                              ${
                                isActive
                                  ? "bg-[#DCE8CA] text-[#637654]"
                                  : "bg-[#F1EEE6] text-[#858A82] group-hover:bg-[#E8EEDC] group-hover:text-[#637654]"
                              }
                            `}
                          >
                            {item.icon}
                          </span>

                          <span
                            className={`
                              flex-1
                              text-sm
                              ${
                                isActive
                                  ? "font-bold"
                                  : "font-semibold"
                              }
                            `}
                          >
                            {item.name}
                          </span>

                          {isActive && (
                            <span
                              className="
                                w-1.5
                                h-1.5
                                rounded-full
                                bg-[#88A56C]
                              "
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              {/* ======================================================
                  FOOTER
                  ====================================================== */}

              <div
                className="
                  px-5
                  pb-4
                  pt-1
                  text-center
                "
              >
                <span
                  className="
                    text-[11px]
                    text-[#AAA99F]
                    tracking-wide
                  "
                  style={{
                    fontFamily: "Nunito",
                  }}
                >
                  little moments • big memories
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
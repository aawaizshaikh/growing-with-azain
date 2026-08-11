import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";

import logoStar from "../assets/illustrations/star.png";

import { HiOutlineHome } from "react-icons/hi";
import {
  HiOutlineCalendar,
  HiOutlinePhoto,
  HiOutlineHeart,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineMusicalNote,
  HiOutlineEnvelope,
} from "react-icons/hi2";

import { FaRegStar } from "react-icons/fa6";


export default function Navbar() {

  const [mobileMenu, setMobileMenu] = useState(false);


  /* ============================================================
     NAVIGATION ITEMS
     ============================================================ */

  const menu = [

    {
      name: "Home",
      path: "/",
      icon: <HiOutlineHome size={22} />,
    },

    {
      name: "Timeline",
      path: "/timeline",
      icon: <HiOutlineCalendar size={22} />,
    },

    {
      name: "Milestones",
      path: "/milestones",
      icon: <FaRegStar size={18} />,
    },

    {
      name: "Favorite Songs",
      path: "/favorite-songs",
      icon: <HiOutlineMusicalNote size={22} />,
    },

    {
      name: "Gallery",
      path: "/gallery",
      icon: <HiOutlinePhoto size={22} />,
    },

    {
      name: "Letters",
      path: "/letters",
      icon: <HiOutlineEnvelope size={22} />,
    },

    {
      name: "About Azain",
      path: "/about",
      icon: <HiOutlineHeart size={22} />,
    },

  ];


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
              "
            />


            <div>

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
              DESKTOP MENU
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
              setMobileMenu(!mobileMenu)
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

            {mobileMenu ? (

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

          {mobileMenu && (

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
                      setMobileMenu(false)
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
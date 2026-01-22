"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface NavItem {
  id: number;
  icon: React.ReactNode;
  label: string;
  path?: string;
  action?: "wallet";
}

const LumaBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  const items: NavItem[] = [
    { id: 0, icon: <Home size={22} />, label: "Home", path: "/" },
    { id: 1, icon: <Users size={22} />, label: "Network", path: "/graph" },
    { id: 2, icon: <Wallet size={22} />, label: isConnected ? `${address?.slice(0, 4)}...` : "Wallet", action: "wallet" },
  ];

  // Determine active index based on current path
  const getActiveIndex = () => {
    if (location.pathname === "/") return 0;
    if (location.pathname === "/graph") return 1;
    return 0;
  };

  const [active, setActive] = useState(getActiveIndex);

  useEffect(() => {
    setActive(getActiveIndex());
  }, [location.pathname]);

  const handleClick = (item: NavItem, index: number) => {
    if (item.action === "wallet") {
      if (isConnected) {
        disconnect();
      } else {
        setShowConnectors(true);
      }
    } else if (item.path) {
      setActive(index);
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-4 left-3 right-3 z-50 sm:hidden">
        <div className="relative flex items-center justify-around bg-white/90 dark:bg-gray-100/95 backdrop-blur-xl rounded-2xl px-2 py-1.5 shadow-lg border border-gray-200/80 overflow-hidden">

          {/* Active Indicator Glow */}
          <motion.div
            layoutId="active-indicator"
            className="absolute w-16 h-10 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl blur-xl opacity-70"
            animate={{
              left: `calc(${active * (100 / items.length)}% + ${100 / items.length / 2}%)`,
              translateX: "-50%",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />

          {items.map((item, index) => {
            const isActive = item.path ? index === active : false;
            const isWallet = item.action === "wallet";

            return (
              <motion.div key={item.id} className="relative flex flex-col items-center group flex-1">
                {/* Button */}
                <motion.button
                  onClick={() => handleClick(item, index)}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  disabled={isPending}
                  className={`flex flex-col items-center justify-center w-full py-2 rounded-xl relative z-10 transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80"
                      : isWallet && isConnected
                        ? "text-green-600"
                        : "text-gray-500"
                  }`}
                >
                  {isPending && isWallet ? (
                    <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  ) : isWallet && isConnected ? (
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, #${address?.slice(2, 8)} 0%, #${address?.slice(-6)} 100%)`,
                      }}
                    />
                  ) : (
                    item.icon
                  )}
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </motion.button>

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Wallet Connector Modal */}
      {showConnectors && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 sm:hidden"
            onClick={() => setShowConnectors(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 sm:hidden shadow-2xl"
          >
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3" />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect Wallet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Choose a wallet to connect
              </p>
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector });
                      setShowConnectors(false);
                    }}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
                      {connector.name === 'MetaMask' && (
                        <svg className="w-6 h-6" viewBox="0 0 35 33" fill="none">
                          <path d="M32.96 1L19.47 11.13l2.5-5.93L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.04 1l13.36 10.22-2.37-6.02L2.04 1zM28.15 23.76l-3.59 5.5 7.68 2.11 2.2-7.49-6.29-.12zM.56 23.88l2.19 7.49 7.68-2.11-3.59-5.5-6.28.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {connector.name === 'Coinbase Wallet' && (
                        <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none">
                          <rect width="28" height="28" rx="5.6" fill="#0052FF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M14 23.8c5.412 0 9.8-4.388 9.8-9.8 0-5.412-4.388-9.8-9.8-9.8-5.412 0-9.8 4.388-9.8 9.8 0 5.412 4.388 9.8 9.8 9.8zm-3.733-11.55a.817.817 0 00-.817.817v2.866c0 .451.366.817.817.817h7.466a.817.817 0 00.817-.817v-2.866a.817.817 0 00-.817-.817h-7.466z" fill="#fff"/>
                        </svg>
                      )}
                      {connector.name !== 'MetaMask' && connector.name !== 'Coinbase Wallet' && (
                        <Wallet className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {connector.name}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowConnectors(false)}
                className="w-full mt-4 py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default LumaBar;

  "use client";

import { useEffect, useState } from "react";
 

const PREVIEW_TABS = ["original", "translated", "summary"] as const;
type PreviewTab = typeof PREVIEW_TABS[number];

export function Landing() {
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>(
    "original",
  );

  useEffect(() => {
    const id = setInterval(() => {
      setActivePreviewTab((prev) => {
        const currentIndex = PREVIEW_TABS.indexOf(prev);
        const nextIndex = (currentIndex + 1) % PREVIEW_TABS.length;
        return PREVIEW_TABS[nextIndex]!;
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen w-screen overflow-hidden">
      <div className="bg-gradient-radial absolute inset-0 opacity-50 dark:opacity-100" />
      <div className="absolute inset-0 z-0">
       
        
       
        <div className="absolute top-2/3 left-0 w-full h-20 opacity-30">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
            <path className="animate-wave" d="M0,50 C200,10 400,90 600,50 C800,10 1000,90 1200,50 L1200,100 L0,100 Z" fill="#8B5CF6"></path>
            <path className="animate-wave-delay" d="M0,50 C200,90 400,10 600,50 C800,90 1000,10 1200,50 L1200,100 L0,100 Z" fill="#2E8BFD"></path>
          </svg>
        </div>
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex mt-16 flex-1 items-center justify-center">
          <div className="container mx-auto px-6 text-center">
            <div className="mx-auto mb-8 max-w-3xl">
              <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white animate-fade-in">
                Translate documents effortlessly with{" "}
                <span className="text-[#431fb8] dark:text-[#835dfc]">Transpera Ai</span>
              </h2>

            </div>
            <div className="mx-auto max-w-3xl text-center relative animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="relative w-full h-[300px] bg-gray-200 rounded-2xl shadow-xl overflow-hidden group">
                <div className="absolute inset-0 p-5 sm:p-6 text-left text-gray-700 bg-white/80 backdrop-blur-sm flex flex-col">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                  
                    <div className="flex items-center gap-1 rounded-lg bg-white/70 p-1 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/10">
                      <button
                        onClick={() => setActivePreviewTab("original")}
                        className={
                          "rounded-md px-3 py-1 text-xs font-medium transition-colors " +
                          (activePreviewTab === "original"
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:text-foreground")
                        }
                      >
                        Original
                      </button>
                      <button
                        onClick={() => setActivePreviewTab("translated")}
                        className={
                          "rounded-md px-3 py-1 text-xs font-medium transition-colors " +
                          (activePreviewTab === "translated"
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:text-foreground")
                        }
                      >
                        Translated
                      </button>
                      <button
                        onClick={() => setActivePreviewTab("summary")}
                        className={
                          "rounded-md px-3 py-1 text-xs font-medium transition-colors " +
                          (activePreviewTab === "summary"
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:text-foreground")
                        }
                      >
                        Summary
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex-1 overflow-auto pr-1">
                    {activePreviewTab === "original" && (
                      <>
                        <h3 className="text-xl font-bold leading-snug sm:text-2xl">
                          The Future of AI in Content Creation
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-800 md:text-[15px]">
                          Artificial intelligence is rapidly transforming the landscape of content creation, offering innovative solutions for efficiency and personalization. From automating basic tasks to generating complex narratives, AI tools are empowering creators to explore new frontiers. This shift promises not only increased productivity but also unprecedented levels of customization in how information is consumed and shared globally.
                        </p>
                      </>
                    )}
                    {activePreviewTab === "translated" && (
                      <>
                        <h3 className="text-xl font-bold leading-snug sm:text-2xl">
                          सामग्री निर्माण में AI का भविष्य
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-800 md:text-[15px]">
                          आर्टिफिशियल इंटेलिजेंस सामग्री निर्माण के परिदृश्य को तेजी से बदल रहा है, दक्षता और व्यक्तिगतकरण के लिए नवाचारी समाधान प्रदान कर रहा है। बुनियादी कार्यों के स्वचालन से लेकर जटिल कथाएं बनाने तक, AI उपकरण रचनाकारों को नई सीमाओं का पता लगाने के लिए सक्षम बना रहे हैं। यह बदलाव न केवल उत्पादकता बढ़ाने का वादा करता है बल्कि वैश्विक स्तर पर जानकारी के उपभोग और साझा करने के तरीके में अभूतपूर्व निजीकरण भी लाता है।
                        </p>
                      </>
                    )}
                    {activePreviewTab === "summary" && (
                      <>
                        <h3 className="text-xl font-bold leading-snug sm:text-2xl">
                          Executive Summary
                        </h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-800 md:text-[15px]">
                          <li>AI boosts efficiency and enables personalization.</li>
                          <li>Tools span from automation to narrative generation.</li>
                          <li>Greater customization in content consumption globally.</li>
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 md:text-sm">Page 1 of 10</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-violet-500/30 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100">
                  <span className="text-white text-2xl font-bold drop-shadow-lg md:text-3xl">TRANSLATING...</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-l from-violet-500/30 to-blue-400/30 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100 delay-100">
                  <span className="text-white text-2xl font-bold drop-shadow-lg md:text-3xl">SUMMARIZING...</span>
                </div>
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
            
                  <div className="relative bg-white/70 backdrop-blur-lg border border-gray-300 p-2 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-primary/20 animate-pulse-glow">
                    <div className="relative w-full h-32 border-2 border-dashed border-gray-400 rounded-lg flex flex-col justify-center items-center text-center p-4 cursor-pointer hover:border-primary transition-colors">
                      <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" />
                      <div className="flex flex-col items-center justify-center text-gray-600">
                        <svg className="h-10 w-10 text-gray-500 mb-2" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <p className="font-semibold text-sm">Drag & drop or <span className="text-primary font-bold">click to upload</span></p>
                        <p className="text-xs mt-1">(PDF, DOCX, PPT, EPUB)</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <p className="mt-5 text-xs text-gray-500 dark:text-gray-400 md:text-sm">Hover over the showcase to interact and upload your own document.</p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}



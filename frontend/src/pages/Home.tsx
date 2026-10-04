
import { useEffect, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Home() {
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)")
        const updateLayout = () => setIsDesktop(mediaQuery.matches)

        updateLayout()
        mediaQuery.addEventListener("change", updateLayout)

        return () => mediaQuery.removeEventListener("change", updateLayout)
    }, [])

    return(
        <div className="container mx-auto p-4">
            <div
                className="min-h-60 resize-y overflow-auto border"
                style={{ height: "60vh" }}
            >
                <ResizablePanelGroup
                    orientation={isDesktop ? "horizontal" : "vertical"}
                    className="h-full bg-card p-3 text-card-foreground"
                >
                    <ResizablePanel defaultSize={isDesktop ? "25%" : "24%"} minSize="16%">
                        <div className="flex h-full items-center justify-center border border-slate-200 bg-slate-100 p-4 text-center font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                            Sidebar
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="76%" minSize="35%">
                        <ResizablePanelGroup orientation="vertical">
                            <ResizablePanel defaultSize="72%" minSize="35%">
                                <div className="flex h-full items-center justify-center border border-blue-200 bg-blue-50 p-4 text-center font-medium text-blue-950 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-100">
                                    Main Content (Wide)
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize="28%" minSize="18%">
                                <div className="flex h-full items-center justify-center border border-green-200 bg-green-50 p-4 text-center font-medium text-green-950 dark:border-green-900 dark:bg-green-950/50 dark:text-green-100">
                                    Footer (Full Width)
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            <div className="mt-10">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                    <Card>
                        <CardContent>Card</CardContent>
                    </Card>
                    <Card>
                        <CardContent>Card</CardContent>
                    </Card>
                    <Card>
                        <CardContent>Card</CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}
import React from "react";
import { Mousewheel, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import { cn } from "@workspace/ui/lib/utils";
import { Group } from "@/lib/types";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";

type Props = {
  gropus: Group[];
};

const LIST = [
  "Account",
  "Billing",
  "Payments",
  "Invites",
  "Security",
  "Settings",
  "Support",
  "API Keys",
  "Team",
  "Tab 1",
  "Tab 2",
  "Tab 3",
  "Tab 4",
  "Tab 5",
  "Tab 6",
  "Tab 7",
  "Tab 8",
  "Tab 9",
  "Tab 10",
];

const Tabs = ({ gropus }: Props) => {
  return (
    <div className="mt-5 mb-3 w-full flex">
      <Swiper
        slidesPerView={"auto"}
        spaceBetween={30}
        modules={[Pagination, Mousewheel]}
        className="mySwiper"
        mousewheel={{
          enabled: true,
          releaseOnEdges: true,
        }}
      >
        {LIST.map((group, idx) => (
          <SwiperSlide
            className={cn(
              " max-w-[300px] w-fit my-auto",
              idx == 0 ? "border-b border-foreground" : ""
            )}
            style={{ width: "fit-content" }}
          >
            <div className="justify-center mx-auto w-fit group px-2 cursor-pointer flex flex-col items-center">
              <h6
                className={cn(
                  "text-sm text-muted-foreground",
                  idx === 0 ? "font-bold" : "font-normal",
                  idx === 0 ? "text-foreground" : "text-muted-foreground",
                  "group-hover:text-foreground text-center",
                  "text-nowrap"
                )}
              >
                {group}
              </h6>
            </div>
          </SwiperSlide>
        ))}
        <SwiperSlide
          className="max-w-[300px] w-fit border-l px-2"
          style={{ width: "fit-content" }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-fit px-2 h-[25px] cursor-pointer flex flex-col items-center justify-center",
                  "rounded focus-visible:ring-transparent"
                )}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => {}}
              >
                Status Bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => {}}
                disabled
              >
                Activity Bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => {}}
              >
                Panel
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Tabs;

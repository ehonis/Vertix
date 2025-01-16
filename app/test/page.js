'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const panels = [
  { id: 1, content: 'Panel 1' },
  { id: 2, content: 'Panel 2' },
  { id: 3, content: 'Panel 3' },
];

export default function Carousel() {
  return (
    <Swiper
      direction="vertical"
      spaceBetween={50}
      slidesPerView={1}
      className="h-[calc(100vh-4rem)]"
    >
      {panels.map((panel) => (
        <SwiperSlide key={panel.id}>
          <div className="flex justify-center items-center h-full bg-blue-500 text-white text-2xl">
            {panel.content}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

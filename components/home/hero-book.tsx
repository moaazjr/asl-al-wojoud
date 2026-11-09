import Image from "next/image";

export function HeroBook() {
  return (
    <div className="book3d-stage" tabIndex={0} aria-label="غلاف كتاب أصل الوجود">
      <div className="book3d">
        <div className="book3d-back" aria-hidden />
        <div className="book3d-pages" aria-hidden />
        <div className="book3d-spine" aria-hidden>
          <span>أصل الوجود</span>
        </div>
        <Image
          src="/asl-alwujoud.jpg"
          alt="غلاف كتاب أصل الوجود"
          width={1066}
          height={1600}
          sizes="(min-width: 1024px) 152px, (min-width: 640px) 136px, 104px"
          priority
          className="book3d-front"
        />
      </div>
    </div>
  );
}

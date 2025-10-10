import { Calendar, Clock, ExternalLink, Link, MapPin } from "lucide-preact";
import type { JSX } from "preact";

export interface CardProps {
  title: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
  buttonText: string;
  buttonUrl: string;
  sourceName?: string;
  sourceUrl?: string;
}

export default function Card(props: CardProps): JSX.Element {
  const isClickable = !!props.sourceUrl && !props.buttonUrl;

  const handleImageError: JSX.GenericEventHandler<HTMLImageElement> = (
    event,
  ) => {
    event.currentTarget.classList.add("hidden");
  };

  const getHostname = (url: string | undefined): string | null => {
    if (!url) {
      return null;
    }
    try {
      return new URL(url).hostname;
    } catch (e) {
      return null;
    }
  };

  const hostname = getHostname(props.sourceUrl);

  const CardBody = (
    <div class="flex-grow">
      <div class="relative">
        <div class="w-full h-48 flex items-center justify-center bg-gray-300">
          <svg
            class="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Placeholder image</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        {props.imageUrl && props.imageUrl.trim().length > 0 && (
          <img
            class="absolute inset-0 w-full h-full object-cover bg-gray-200"
            src={props.imageUrl}
            alt={props.title}
            loading="lazy"
            onError={handleImageError}
          />
        )}
        {hostname && (
          <a
            href={props.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="absolute top-3 left-3 bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1.5 rounded-lg flex items-center backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=16`}
              alt=""
              class="w-4 h-4 mr-1.5"
              loading="lazy"
              onError={handleImageError}
            />
            {props.sourceName || hostname}
          </a>
        )}
      </div>

      <div class="p-5">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{props.title}</h2>

        <div class="space-y-3 text-gray-600 mb-4">
          <div class="flex items-center">
            <Calendar size={18} class="mr-3 text-gray-500" />
            <span>{props.date}</span>
          </div>
          <div class="flex items-center">
            <Clock size={18} class="mr-3 text-gray-500" />
            <span>{props.time}</span>
          </div>
          <div class="flex items-center">
            <MapPin size={18} class="mr-3 text-gray-500" />
            <span>{props.location}</span>
          </div>
        </div>

        <p class="text-gray-700 text-base mb-5">{props.description}</p>

        {props.sourceUrl && (
          <div class="flex items-center text-sm text-gray-500 mb-4">
            <Link size={16} class="mr-2" />
            <span>{props.sourceName || props.sourceUrl}</span>
          </div>
        )}

        <div class="flex flex-wrap">
          {props.tags.map((tag) => (
            <span
              key={tag}
              class="bg-fuchsia-100 text-fuchsia-600 text-sm font-semibold mr-2 mb-2 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const CardActions = (
    <div class="p-5 pt-0">
      {props.buttonUrl ? (
        <a
          href={props.buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          {props.buttonText}
          <ExternalLink size={20} class="ml-2" />
        </a>
      ) : (
        isClickable && (
          <div class="w-full flex items-center justify-center bg-teal-500 text-white font-bold py-3 px-4 rounded-lg">
            {props.buttonText}
            <ExternalLink size={20} class="ml-2" />
          </div>
        )
      )}
    </div>
  );

  const baseClasses =
    "max-w-sm rounded-2xl border border-purple-200 bg-white shadow-lg overflow-hidden font-sans flex flex-col";
  const hoverClasses = "hover:shadow-xl transition-shadow duration-300";

  if (isClickable) {
    return (
      <a
        href={props.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        class={`${baseClasses} ${hoverClasses} block`}
      >
        {CardBody}
        {CardActions}
      </a>
    );
  }

  return (
    <div class={baseClasses}>
      {CardBody}
      {CardActions}
    </div>
  );
}

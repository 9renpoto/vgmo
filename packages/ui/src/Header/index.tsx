import { Menu, Music, Search, X } from "lucide-preact";

type Props = {
  active: string;
  menus?: { name: string; href: string }[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
};

export default function Header({
  active,
  menus = [],
  searchQuery = "",
  onSearchChange,
  showSearch = true,
}: Props) {
  const toggleId = "header-menu-toggle";

  return (
    <header class="bg-white w-full py-4 px-6 md:px-8 flex flex-col md:flex-row gap-4 items-center shadow-md sticky top-0 z-50">
      <div class="flex items-center justify-between w-full md:w-auto">
        <a href="/" class="flex items-center">
          <Music aria-hidden="true" />
          <div class="text-2xl ml-1 font-bold">vgmo</div>
        </a>
        <div class="flex items-center gap-2 md:hidden">
          {menus.length > 0 && (
            <>
              <input
                id={toggleId}
                type="checkbox"
                class="hidden peer md:hidden"
              />
              <label
                for={toggleId}
                class="md:hidden flex items-center justify-end text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-controls="header-navigation"
                aria-expanded={undefined}
              >
                <span class="sr-only">メニュー</span>
                <Menu
                  size={24}
                  class="inline peer-checked:hidden"
                  aria-hidden="true"
                />
                <X
                  size={24}
                  class="hidden peer-checked:inline"
                  aria-hidden="true"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {showSearch && (
        <div class="relative w-full md:w-72 my-1 md:my-0">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} aria-hidden="true" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onInput={(e) =>
              onSearchChange?.((e.target as HTMLInputElement).value)
            }
            placeholder="タイトル・開催地域で検索..."
            aria-label="コンサートを検索"
            class="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>
      )}
      {menus.length > 0 && (
        <nav
          id="header-navigation"
          class="hidden peer-checked:block md:flex items-center gap-6 w-full md:w-auto"
        >
          <ul class="flex flex-col md:flex-row items-center gap-6">
            {menus.map((menu) => (
              <li key={menu.name}>
                <a
                  href={menu.href}
                  class={`text-gray-500 hover:text-gray-700 py-1 border-gray-500 ${
                    active === menu.name ? "font-bold border-b-2" : ""
                  }`}
                >
                  {menu.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

import { Menu, Music, X } from "lucide-preact";

type Props = {
  active: string;
  menus?: { name: string; href: string }[];
};

export default function Header({ active, menus = [] }: Props) {
  const toggleId = "header-menu-toggle";

  return (
    <header class="bg-white w-full py-4 px-6 md:px-8 flex flex-col md:flex-row gap-4 items-center shadow-md sticky top-0 z-50">
      <div class="flex items-center justify-between w-full md:w-auto">
        <a href="/" class="flex items-center">
          <Music aria-hidden="true" />
          <div class="text-2xl ml-1 font-bold">vgmo</div>
        </a>
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

type Breadcrumb = {
  label: string;
  href?: string;
};

type Props = {
  breadcrumbs: Breadcrumb[];
};

export const Breadcrumbs = ({ breadcrumbs }: Props) => {
  return (
    <nav aria-label="breadcrumb">
      <ol class="flex space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={`${breadcrumb.label}-${breadcrumb.href}`}
            class="flex items-center"
          >
            {index > 0 && <span class="mx-2">/</span>}
            {breadcrumb.href ? (
              <a href={breadcrumb.href} class="text-blue-600 hover:underline">
                {breadcrumb.label}
              </a>
            ) : (
              <span class="text-gray-500">{breadcrumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

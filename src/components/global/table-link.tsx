import { Link } from "@tanstack/react-router";

interface TableLinkProps<K extends string = string> {
  to: string;
  paramKey: K;
  paramValue: string | number;
}

export default function TableLink<K extends string>({
  to,
  paramKey,
  paramValue,
}: TableLinkProps<K>) {

  return (
    <Link
      to={to}
      params={{ [paramKey]: paramValue } as Record<K, string | number>}
      className=" hover:bg-white duration-200 py-1 px-2 rounded-md text-telnet-primary hover:text-telnet-dark-brown font-semibold"
    >
      {paramValue}
    </Link>
  );
}

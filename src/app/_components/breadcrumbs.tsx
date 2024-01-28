import * as React from "react";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

interface BasicBreadcrumbsProps {
  links: string[][];
}
export default function BasicBreadcrumbs({ links }: BasicBreadcrumbsProps) {
  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        {links.map((l, index) => {
          return index !== links.length - 1 ? (
            <Link underline="hover" color="inherit" href={l[1]}>
              {l[0]}
            </Link>
          ) : (
            <Typography color="text.primary">{l[0]}</Typography>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}

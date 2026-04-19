import { Box, Container, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ title, breadcrumbs, actions, children }: PageLayoutProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, i) =>
            crumb.href ? (
              <MuiLink
                key={i}
                component={Link}
                to={crumb.href}
                underline="hover"
                color="inherit"
              >
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography key={i} color="text.primary">
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          {title}
        </Typography>
        {actions && <Box>{actions}</Box>}
      </Box>

      {children}
    </Container>
  );
}

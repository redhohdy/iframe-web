import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const data = [
  { title: 'Page title 1', views: 10000 },
  { title: 'Page title 2', views: 3000 },
  { title: 'Page title 3', views: 1000 },
  { title: 'Page title 4', views: 5000 },
  { title: 'Page title 5', views: 840 },
  { title: 'Page title 6', views: 4830 },
  { title: 'Page title 7', views: 3000 },
  { title: 'Page title 8', views: 3520 },
];

const rowsPerPage = 5;

const PopularContent = () => {
    const [page, setPage] = useState(0);

    const sortedData = [...data].sort((a, b) => b.views - a.views);

    const handleNextPage = () => {
    if (page < Math.ceil(sortedData.length / rowsPerPage) - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };
  
  const paginatedData = sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return ( 
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Views by Page Title
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            #1 {sortedData[0].title}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {sortedData[0].views.toLocaleString()}
          </Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PAGE TITLE</TableCell>
              <TableCell align="right">VIEWS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.title}>
                <TableCell>{row.title}</TableCell>
                <TableCell align="right">
                  {row.views.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 2 
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries.
          </Typography>
          <Box>
            <IconButton size="small" onClick={handlePrevPage} disabled={page === 0}>
              <ChevronLeft size={20} />
            </IconButton>
            <Typography component="span" sx={{ mx: 1 }}>
              {page + 1}
            </Typography>
            <IconButton size="small" onClick={handleNextPage} disabled={page >= Math.ceil(sortedData.length / rowsPerPage) - 1}>
              <ChevronRight size={20} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
     );
}
 
export default PopularContent;
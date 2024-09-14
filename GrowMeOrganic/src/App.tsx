import React, { useState, useEffect, useRef } from 'react';
import { DataTable, DataTablePageParams } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';

// Defining the structure of the data returned by the API
interface ArtItem {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

interface ApiResponse {
    data: ArtItem[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
        next_url: string | null;
        prev_url: string | null;
    };
}

const App: React.FC = () => {
    // State for the art items and pagination
    const [artItems, setArtItems] = useState<ArtItem[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(12); // Default number of rows per page
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [rowClick, setRowClick] = useState<boolean>(false); // Toggle for rowClick vs checkbox
    const [selectedArtItems, setSelectedArtItems] = useState<ArtItem[]>([]); // Selection state for checkbox


    const [numberOfRecords, setNumberOfRecords] = useState<number>(0);
    const op = useRef<OverlayPanel>(null);

    
    const fetchArtData = async (page: number, rowsPerPage: number) => {
        setLoading(true); // Show loading indicator while fetching data

        try {
            // Make the API call to fetch data for the current page
            const response = await axios.get<ApiResponse>(
                `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
            );
            
            // Destructure the response data
            const { data, pagination } = response.data;

            // Update state with the fetched data
            setArtItems(data);
            setTotalRecords(pagination.total);
        } catch (error) {
            console.error("Error fetching data from API:", error);
        } finally {
            setLoading(false); // Stop the loading indicator
        }
    };

    
    useEffect(() => {
        fetchArtData(1, rows)
    }, [rows])

    const onPageChange = (event: DataTablePageParams) => {
        setFirst(event.first);
        setRows(event.rows);

        const pageNumber = event.first / event.rows + 1
        fetchArtData(pageNumber, event.rows);
    };




    const handleSelectRecords = () => {
      if (numberOfRecords > 0 && numberOfRecords <= artItems.length) {
         
          setSelectedArtItems(artItems.slice(0, numberOfRecords));
      }
      
      if (op.current) {
          op.current.hide();
      }
  };

    return (
        

           <>
              <div>
              <Button type="button" icon="pi pi-image" label="Select Records" onClick={(e) => op.current?.toggle(e)} />
               <OverlayPanel ref={op}>
                  <div>
                   <h5>Enter number of records to select</h5>
                    <input
                     type="number"
                     value={numberOfRecords}
                     onChange={(e) => setNumberOfRecords(Number(e.target.value))}
                      min="1"
                     max={artItems.length}
                     style={{ width: '100%', marginBottom: '10px' }}
                      />
               <Button label="Select" icon="pi pi-check" onClick={handleSelectRecords} />
                  </div>
                </OverlayPanel>
              </div>



           <DataTable
                value={artItems}
                paginator
                lazy 
                first={first}
                rows={rows}
                totalRecords={totalRecords}
                onPage={onPageChange}
                loading={loading}
                dataKey="id"
                selectionMode={rowClick ? null : 'checkbox'}
                selection={selectedArtItems}
                onSelectionChange={(e) => setSelectedArtItems(e.value)} 
                rowsPerPageOptions={[12, 24, 48]} // Allow users to select rows per page
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
            >
                
                {!rowClick && <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>}

                
                <Column field="title" header="Title" style={{ width: '20%' }}></Column>
                <Column field="place_of_origin" header="Place of Origin" style={{ width: '20%' }}></Column>
                <Column field="artist_display" header="Artist" style={{ width: '20%' }}></Column>
                <Column field="inscriptions" header="Inscriptions" style={{ width: '20%' }}></Column>
                <Column field="date_start" header="Date Start" style={{ width: '10%' }}></Column>
                <Column field="date_end" header="Date End" style={{ width: '10%' }}></Column>
            </DataTable>
           </>
            
        
    );
};

export default App;

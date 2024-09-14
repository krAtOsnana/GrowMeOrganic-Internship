import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputSwitch } from 'primereact/inputswitch'; 
import axios from 'axios';

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
    const [artItems, setArtItems] = useState<ArtItem[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(12); 
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [rowClick, setRowClick] = useState<boolean>(false); 
    const [selectedArtItems, setSelectedArtItems] = useState<ArtItem[]>([]);
    const [numberOfRecords, setNumberOfRecords] = useState<number>(0); 
    const op = useRef<OverlayPanel>(null);

    // Fetch data from the API 
    const fetchArtData = async (page: number, rowsPerPage: number) => {
        setLoading(true)

        try {
            const response = await axios.get<ApiResponse>(
                `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
            );
            const { data, pagination } = response.data;

            setArtItems(data);
            setTotalRecords(pagination.total);
        } catch (error) {
            console.error('Error fetching data from API:', error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchArtData(1, rows);
    }, [rows]);

    // Handleing pagination effect on change
    const onPageChange = (event: any) => {
        setFirst(event.first);
        setRows(event.rows);

        const pageNumber = event.first / event.rows + 1;
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
               
                <div style={{ marginBottom: '20px' }}>
                    <h5>Toggle between row click and checkbox selection</h5>
                    <InputSwitch checked={rowClick} onChange={(e) => setRowClick(e.value)} />
                </div>

                
                <Button type="button" icon="pi pi-image" label="Select Records" onClick={(e) => op.current?.toggle(e)} />
                <OverlayPanel ref={op} style={{ background: 'white' }}>
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
                onSelectionChange={(e: any) => setSelectedArtItems(e.value)}
                rowsPerPageOptions={[12, 24, 48]}
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

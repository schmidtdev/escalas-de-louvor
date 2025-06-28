import html2canvas from 'html2canvas';

export async function downloadTableAsImage(element: HTMLElement, filename: string) {
  try {
    // Criar um clone do elemento para não afetar o original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Estilizar o clone para a imagem
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '1400px'; // Largura maior para melhor qualidade
    clone.style.backgroundColor = '#ffffff';
    clone.style.padding = '24px';
    clone.style.fontFamily = 'Arial, sans-serif';
    clone.style.fontSize = '13px';
    clone.style.lineHeight = '1.5';
    clone.style.border = '2px solid #d1d5db';
    clone.style.borderRadius = '12px';
    clone.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    
    // Remover elementos que não devem aparecer na imagem (botões de ação)
    const actionButtons = clone.querySelectorAll('.action-buttons');
    actionButtons.forEach(button => {
      button.remove();
    });
    
    // Forçar exibição da versão desktop na imagem
    const mobileVersion = clone.querySelectorAll('.lg\\:hidden');
    mobileVersion.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    
    const desktopVersion = clone.querySelector('.hidden.lg\\:block, #desktop-view');
    if (desktopVersion) {
      (desktopVersion as HTMLElement).style.display = 'block';
      (desktopVersion as HTMLElement).classList.remove('hidden');
    }
    
    // Ajustar cabeçalho principal
    const mainHeader = clone.querySelector('.bg-blue-50');
    if (mainHeader) {
      (mainHeader as HTMLElement).style.backgroundColor = '#eff6ff';
      (mainHeader as HTMLElement).style.borderBottom = '2px solid #3b82f6';
      (mainHeader as HTMLElement).style.padding = '20px';
      (mainHeader as HTMLElement).style.textAlign = 'center';
    }
    
    // Estilizar títulos principais
    const mainTitles = clone.querySelectorAll('h3');
    mainTitles.forEach(title => {
      (title as HTMLElement).style.color = '#1e40af';
      (title as HTMLElement).style.fontSize = '24px';
      (title as HTMLElement).style.fontWeight = 'bold';
      (title as HTMLElement).style.marginBottom = '8px';
    });
    
    // Ajustar cabeçalho da tabela
    const tableHeader = clone.querySelector('.table-header, .bg-gray-50');
    if (tableHeader) {
      (tableHeader as HTMLElement).style.backgroundColor = '#f8fafc';
      (tableHeader as HTMLElement).style.borderBottom = '2px solid #e2e8f0';
      (tableHeader as HTMLElement).style.padding = '16px';
    }
    
    // Estilizar os títulos dos grupos
    const groupTitles = clone.querySelectorAll('h4');
    groupTitles.forEach(title => {
      (title as HTMLElement).style.backgroundColor = '#dbeafe';
      (title as HTMLElement).style.border = '2px solid #3b82f6';
      (title as HTMLElement).style.borderRadius = '8px 8px 0 0';
      (title as HTMLElement).style.padding = '16px';
      (title as HTMLElement).style.margin = '20px 0 0 0';
      (title as HTMLElement).style.fontSize = '18px';
      (title as HTMLElement).style.fontWeight = 'bold';
      (title as HTMLElement).style.color = '#1e40af';
      (title as HTMLElement).style.textAlign = 'left';
    });
    
    // Estilizar os containers de dados dos grupos
    const groupContainers = clone.querySelectorAll('.bg-white.rounded-b-lg');
    groupContainers.forEach(container => {
      (container as HTMLElement).style.border = '2px solid #3b82f6';
      (container as HTMLElement).style.borderTop = 'none';
      (container as HTMLElement).style.borderRadius = '0 0 8px 8px';
      (container as HTMLElement).style.marginBottom = '0';
    });
    
    // Ajustar grid do cabeçalho para 7 colunas (sem ações)
    const headerGrids = clone.querySelectorAll('.grid.grid-cols-8');
    headerGrids.forEach(grid => {
      (grid as HTMLElement).style.display = 'grid';
      (grid as HTMLElement).style.gridTemplateColumns = 'repeat(7, 1fr)';
      (grid as HTMLElement).style.gap = '16px';
      (grid as HTMLElement).style.alignItems = 'center';
    });
    
    // Estilizar as linhas de dados
    const dataRows = clone.querySelectorAll('.hover\\:bg-gray-50');
    dataRows.forEach((row, index) => {
      (row as HTMLElement).style.padding = '14px 16px';
      (row as HTMLElement).style.borderBottom = '1px solid #e5e7eb';
      (row as HTMLElement).style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      
      // Ajustar grid da linha de dados
      const rowGrid = row.querySelector('.grid.grid-cols-8');
      if (rowGrid) {
        (rowGrid as HTMLElement).style.display = 'grid';
        (rowGrid as HTMLElement).style.gridTemplateColumns = 'repeat(7, 1fr)';
        (rowGrid as HTMLElement).style.gap = '16px';
        (rowGrid as HTMLElement).style.alignItems = 'center';
      }
    });
    
    // Melhorar espaçamento entre grupos
    const groupsContainer = clone.querySelector('.escalas-groups, .space-y-6');
    if (groupsContainer) {
      (groupsContainer as HTMLElement).style.marginTop = '20px';
      
      // Adicionar espaçamento entre cada grupo
      const groups = groupsContainer.querySelectorAll('.mb-6');
      groups.forEach((group, index) => {
        if (index > 0) {
          (group as HTMLElement).style.marginTop = '32px';
        }
      });
    }
    
    // Ajustar textos para melhor legibilidade
    const allTexts = clone.querySelectorAll('div[class*="text-sm"]');
    allTexts.forEach(text => {
      (text as HTMLElement).style.fontSize = '13px';
      (text as HTMLElement).style.lineHeight = '1.4';
      (text as HTMLElement).style.color = '#374151';
    });
    
    const fontMediumTexts = clone.querySelectorAll('.font-medium');
    fontMediumTexts.forEach(text => {
      (text as HTMLElement).style.fontWeight = '600';
      (text as HTMLElement).style.color = '#1f2937';
    });
    
    // Adicionar o clone ao documento
    document.body.appendChild(clone);
    
    // Aguardar um momento para o navegador renderizar
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Capturar a imagem
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2, // Alta qualidade
      useCORS: true,
      allowTaint: false,
      width: 1400,
      height: clone.scrollHeight + 48,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      onclone: (clonedDoc) => {
        // Garantir que o clone no canvas tenha os estilos corretos
        const clonedElement = clonedDoc.body.querySelector('[style*="position: absolute"]');
        if (clonedElement) {
          (clonedElement as HTMLElement).style.position = 'static';
          (clonedElement as HTMLElement).style.left = 'auto';
        }
      }
    });
    
    // Remover o clone
    document.body.removeChild(clone);
    
    // Converter para blob e fazer download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0);
    
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    throw new Error('Falha ao gerar a imagem. Verifique se o navegador suporta esta funcionalidade.');
  }
}

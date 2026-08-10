export interface SelectedAssetDetail {
  id: string
  name: string
  category: string
  status: string
  coordinates: [number, number]
  description: string
  relatedIncidents: string[]
}

export class SelectionManager {
  private selectedAsset: SelectedAssetDetail | null = null

  public setSelectedAsset(asset: SelectedAssetDetail | null): SelectedAssetDetail | null {
    this.selectedAsset = asset
    return this.selectedAsset
  }

  public getSelectedAsset(): SelectedAssetDetail | null {
    return this.selectedAsset
  }

  public clearSelection(): void {
    this.selectedAsset = null
  }
}

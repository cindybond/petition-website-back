type Petition = {
    /**
     * Petition id as defined by the database
     */
    petitionId: number,
    /**
     * title as entered when created
     */
    title: string,
    /**
     * category id
     */
    categoryId: number,
    /**
     * ownerID
     */
    ownerId: number,
    /**
     * owner first name
     */
    ownerFirstName: string,
    /**
     * owner last name
     */
    ownerLastName: string,
    /**
     * number of supporters
     */
    numberOfSupporters: number,
    /**
     * creation date
     */
    creationDate: string,
    /**
     * description
     */
    description: string,
    /**
     * money raised
     */
    moneyRaised: number
}

type SupportTier = {
    /**
     * support tier id
     */
    supportTierId: number,
    /**
     * title
     */
    title: string,
    /**
     * description
     */
    description: string,
    /**
     * cost
     */
    cost: number
}

type CombinedPetition = {
    supportTiers: SupportTier[]
} & Petition
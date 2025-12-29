// backend/transaction.js

async function sendMoney(senderId, receiverId, amount) {
    // 1. Fetch Sender and Receiver Wallets from Supabase
    const { data: senderWallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', senderId)
        .single();

    // 2. Security Check: Do they have the funds?
    if (senderWallet.balance < amount) {
        return { success: false, message: "Insufficient Mana (Funds)" };
    }

    // 3. THE TRANSACTION (Atomic Operation)
    // We subtract from A and add to B
    const { error } = await supabase.rpc('transfer_money', {
        p_sender: senderId,
        p_receiver: receiverId,
        p_amount: amount
    });

    if (error) return { success: false, message: "Transaction Failed" };

    return { 
        success: true, 
        message: `Transferred $${amount} successfully!`,
        newBalance: senderWallet.balance - amount 
    };
}
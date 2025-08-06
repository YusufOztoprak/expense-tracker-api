const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
    const { filter } = req.query;
    const userId = req.user.id;

    try {
        let dateFilter = {};
        const now = new Date();

        switch (filter) {
            case 'week':
                dateFilter = { date: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
                break;
            case 'month':
                dateFilter = { date: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
                break;
            case '3months':
                dateFilter = { date: { $gte: new Date(now.setMonth(now.getMonth() - 3)) } };
                break;
            case 'custom':
                if (req.query.start && req.query.end) {
                    dateFilter = {
                        date: {
                            $gte: new Date(req.query.start),
                            $lte: new Date(req.query.end)
                        }
                    };
                }
                break;
        }

        const expenses = await Expense.find({
            user: userId,
            ...dateFilter
        }).sort('-date');

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addExpense = async (req, res) => {
    const { description, amount, category } = req.body;

    try {
        const expense = await Expense.create({
            description,
            amount,
            category,
            user: req.user.id
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { description, amount, category } = req.body;

    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { description, amount, category },
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const expense = await Expense.findOneAndDelete({
            _id: id,
            user: req.user.id
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
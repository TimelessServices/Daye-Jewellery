const reviewsData = [
    {
        id: 1,
        author: "Anya S.",
        rating: 5,
        text: "Absolutely adore my new necklace! The craftsmanship is superb, and it arrived beautifully packaged. It's become my go-to everyday piece.",
        date: "2023-10-26",
    },
    {
        id: 2,
        author: "Ben T.",
        rating: 5,
        text: "I bought a ring as a gift, and my partner absolutely loved it. The quality is exceptional, and it looks even better in person. Highly recommend!",
        date: "2023-10-20",
    },
    {
        id: 3,
        author: "Chloe L.",
        rating: 4,
        text: "Beautiful earrings, very unique design. The shipping was quick, and the customer service was very helpful when I had a question about sizing.",
        date: "2023-10-15",
    },
];

export default function Reviews() {
    return (
        <section className="w-full p-4 md:p-6 flex flex-col items-center gap-6 md:gap-8 bg-light-background">
            <div className="w-full border-b-2 border-dark text-center pb-2 md:pb-3">
                <h2 className="text-2xl md:text-3xl text-dark font-title">
                    What Our Customers Say
                </h2>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {reviewsData.map((review) => (
                    <div
                        key={review.id}
                        className="flex flex-col p-6 bg-white rounded-xl shadow-md text-dark h-full"
                    >
                        <div className="flex mb-3">
                            {[...Array(review.rating)].map((_, i) => (
                                <span key={i} className="text-gold text-xl">
                                    ⭐
                                </span>
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                                <span key={i} className="text-gray-300 text-xl">
                                    ⭐
                                </span>
                            ))}
                        </div>

                        <p className="font-main text-base md:text-lg italic flex-grow mb-4 leading-relaxed">
                            "{review.text}"
                        </p>

                        <div className="text-sm text-right">
                            <p className="font-bold font-main">
                                {review.author}
                            </p>
                            <p className="text-gray-600">
                                {new Date(review.date).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

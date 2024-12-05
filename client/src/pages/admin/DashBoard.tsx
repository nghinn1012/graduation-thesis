import React from 'react';
import CardDataStats from '../../components/admin/CardDataStats';
import ChartOne from '../../components/admin/ChartOne';
import ChartThree from '../../components/admin/ChartThree';
import ChartTwo from '../../components/admin/ChartTwo';
import { AiOutlineEye } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi';
import { BiPackage } from 'react-icons/bi';
import { HiOutlineUsers } from 'react-icons/hi';

const DashBoard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total views"
          total="$3.456K"
          rate="0.43%"
          levelUp
        >
          <AiOutlineEye className="fill-primary" size={22} />
        </CardDataStats>

        <CardDataStats
          title="Total Profit"
          total="$45,2K"
          rate="4.35%"
          levelUp
        >
          <FiShoppingCart className="fill-primary " size={22} />
        </CardDataStats>

        <CardDataStats
          title="Total Product"
          total="2.450"
          rate="2.59%"
          levelUp
        >
          <BiPackage className="fill-primary " size={22} />
        </CardDataStats>

        <CardDataStats
          title="Total Users"
          total="3.456"
          rate="0.95%"
          levelDown
        >
          <HiOutlineUsers className="fill-primary " size={22} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
      </div>
    </>
  );
};

export default DashBoard;
